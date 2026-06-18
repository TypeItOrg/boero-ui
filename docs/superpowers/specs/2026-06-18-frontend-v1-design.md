# Frontend v1 Design

Date: 2026-06-18

## Goal

Build the first version of the boero-ui frontend so it consumes everything the boero-api backend currently exposes. The frontend is the administration surface for the platform: a platform admin manages institutions and the people inside them, and institutional users manage their own profile, sessions, and (for authorities) the people and roles of their own institution.

The backend source of truth for this spec is the `feat/platform-admin-people-management` branch of boero-api, which adds people management endpoints and a platform admin god mode on top of the already-merged auth, institutions, locations, roles, and permissions endpoints.

The scope is deliberately constrained to what the backend exposes today. Anything the backend does not expose is out of scope and listed at the end.

## Current Context

- The project is a Next.js 16 App Router application with React 19, TypeScript, Tailwind CSS v4, and shadcn/ui (radix-nova preset, neutral base color). Only the `button` primitive is installed.
- The package manager is pnpm. `zod` is installed; no form library, no data-fetching library, no HTTP client, no auth library, no table library, and no toast library are installed yet.
- The Docker workflow is already in place: `make dev` runs the app at `localhost:3000`. `NEXT_PUBLIC_API_URL` is plumbed through env templates, the Dockerfile, and the staging and production Compose files, but nothing consumes it yet.
- The home page renders a single centered Button. There are no routes, no API client, no auth, no forms, no data layer, no middleware or proxy, and no providers beyond the root layout.
- The backend is a Spring Boot 4 / Java 21 / PostgreSQL / Redis API at `http://localhost:8080/api/v1`. It uses JWT (HMAC-SHA256) with access tokens (15 minutes) and refresh tokens (7 days, or 30 days with remember me) returned in the response body, not in cookies. It has no CORS configuration.
- The backend exposes 31 application endpoints plus health and a smoke test, grouped into auth (institutional and platform), institutions, people, locations, roles, and permissions. All user-facing strings are in Spanish. IDs are UUIDv7. There is no response envelope; lists use `PaginatedResponse<T> = { items, page, size, totalItems, totalPages }`.

## Decisions

- **Backend source:** the `feat/platform-admin-people-management` branch. People management, soft delete, the new person permissions, and the platform admin god mode are all assumed available.
- **Auth architecture:** BFF over Next 16 App Router. The browser never calls boero-api directly. Next route handlers proxy server-to-server calls with `Authorization: Bearer`, and tokens live in httpOnly cookies. This resolves the missing backend CORS and keeps tokens out of JavaScript.
- **Data fetching:** RSC-first. Server Components read data with the shared server fetch helper. Mutations are Server Actions. TanStack Query is used only where client-side interactivity is genuinely needed (debounced search, live pagination).
- **Code organization:** vertical slicing. Each feature owns its API calls, types, actions, components, and hooks. `lib/` holds only shared infrastructure.
- **Language:** the UI is in Spanish. All routes are in English.
- **Scope:** platform and institutional surfaces together in one spec.
- **Deferred:** testing and dark mode are out of scope for v1 and will be added afterward.

## Authentication Architecture

The browser talks only to Next, on the same origin. Two server-to-backend paths exist: Server Components and Server Actions call `serverFetch` directly (server-to-server), and client-side TanStack Query calls go through the BFF route handler which delegates to the same `serverFetch`.

```
Browser --(httpOnly cookies, same origin)--> Next
  │
  ├─ Server Components / Server Actions ── serverFetch() ──(Bearer)──> boero-api:8080/api/v1
  └─ Client TanStack Query ── /api/[...path] ── serverFetch() ──(Bearer)──> boero-api:8080/api/v1
```

### Cookies

All cookies are HttpOnly, Secure in non-dev, SameSite=Lax, path `/`.

- `boero_access`: access token. Max age 15 minutes, refreshed server-side on each successful refresh.
- `boero_refresh`: refresh token. Max age 7 days, or 30 days when remember me is set.
- `boero_account`: `"platform"` or `"institutional"`. The proxy uses this to pick the correct refresh endpoint (`/auth/platform/refresh` vs `/auth/refresh`).
- `boero_remember`: remember-me flag. Not sensitive.

### Server Actions for auth

Login, register, and logout are Server Actions in `features/auth/actions.ts`. They call the backend directly server-to-server, then set or clear the cookies above. Forms use `useActionState` and zod.

### BFF proxy

A single catch-all route handler at `app/api/[...path]/route.ts` proxies client-side requests (TanStack Query). It delegates to `serverFetch` so the refresh-on-401 logic lives in one place. The route handler reads the request method, body, and search params, calls `serverFetch` with the matched path, and returns the response. On a terminal auth failure (reuse, revocation) `serverFetch` clears the cookies and throws `ApiError`; the handler maps that to a 401 response so the client redirects to login.

Server Components and Server Actions do not go through this route handler. They call `serverFetch` directly, server-to-server.

### Route gating

`proxy.ts` (Next 16 renamed middleware) reads `boero_account` and redirects without validating the JWT. The real validation happens in the RSC layout of each route group. The institutional layout calls `GET /auth/me` to confirm the session and load the current user. The platform layout calls `GET /permissions` (a `PLATFORM_ADMIN`-only endpoint) as a session probe, since the backend has no platform `/me` endpoint. A 401 from either redirects to `/login?next=<path>`.

### Environment

A new server-only env var `API_URL` (no `NEXT_PUBLIC_` prefix) holds the backend base URL. The existing `NEXT_PUBLIC_API_URL` stays for any rare client-side need but is effectively unused. Update the Dockerfile `ARG` and `ENV` lines, the staging and production Compose build args, and all `.env.*.example` templates.

## Code Organization: Vertical Slicing

### Shared infrastructure (`lib/`)

Only cross-cutting infrastructure lives here. No feature logic.

```
lib/
├── utils.ts                       # cn() helper (exists)
└── api/
    ├── errors.ts                  # ApiError type + mapping from backend error shape
    ├── pagination.ts              # PaginatedResponse<T> type
    ├── server-fetch.ts            # serverFetch(): reads cookies, attaches Bearer, refresh-on-401
    └── client-fetch.ts            # clientFetch(): relative fetch to /api/... for TanStack Query
```

`server-fetch.ts` imports the refresh helper from `features/auth` (the one direction a slice is imported by shared, because auth is the foundational slice).

`components/ui/` holds shadcn primitives shared across slices.

### Slices (`features/<slice>/`)

Each slice contains:

- `api.ts`: server-side data calls using `serverFetch`.
- `types.ts`: TypeScript types mirroring the backend payloads for that slice.
- `actions.ts`: Server Actions (`"use server"`) for mutations, calling `serverFetch` and then `revalidatePath` or `revalidateTag` and `redirect` as needed.
- `components/`: the slice's UI components.
- `hooks.ts` or `queries.ts` (optional): TanStack Query hooks for the few client-side interactive cases.

The seven slices:

1. **`features/auth`** — login (platform and institutional), register, logout, refresh, cookie helpers, the refresh helper used by `lib/api/server-fetch.ts`.
2. **`features/institutions`** — list, detail, create, edit, bootstrap first authority.
3. **`features/people`** — list, detail, create, edit, soft delete, and role management (assign and revoke) for a person. The system roles catalog query lives here too because it is used by the person create form (`initialRole`) and the roles manager.
4. **`features/locations`** — country, province, and city picker with debounced search, backed by TanStack Query.
5. **`features/permissions`** — platform permission catalog view.
6. **`features/sessions`** — the current user's active sessions, with live pagination via TanStack Query.
7. **`features/profile`** — the current user's own profile, view and edit.

### Slice dependencies

Dependencies between slices are minimal and one-directional:

- `features/institutions` uses `features/locations` for the country, province, and city picker in the institution form.
- No other slice imports from another slice. `features/people` is self-contained. `features/permissions`, `features/sessions`, and `features/profile` are leaf slices.
- `lib/api/server-fetch.ts` imports the refresh helper from `features/auth`.

## Routes

All routes are in English. Pages are thin Server Components that call `features/<slice>/api.ts` and render `features/<slice>/components/*`.

```
app/
├── layout.tsx, providers.tsx, proxy.ts, page.tsx, not-found.tsx, error.tsx
├── api/
│   └── [...path]/route.ts                # BFF proxy (Bearer + refresh-on-401)
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx                    # tabs: Platform | Institutional
│   └── register/page.tsx                 # institutional self-register
├── (platform)/
│   ├── layout.tsx                        # sidebar shell + logout
│   ├── institutions/
│   │   ├── page.tsx                      # list (paginated)
│   │   ├── new/page.tsx                  # create
│   │   └── [id]/
│   │       ├── page.tsx                  # detail
│   │       ├── edit/page.tsx             # edit
│   │       ├── authority/page.tsx        # bootstrap first authority
│   │       └── people/
│   │           ├── page.tsx              # list (search + paginated)
│   │           ├── new/page.tsx          # create person (password + initialRole)
│   │           └── [personId]/
│   │               ├── page.tsx          # detail + delete dialog
│   │               ├── edit/page.tsx     # edit
│   │               └── roles/page.tsx    # list, assign, revoke
│   └── permissions/page.tsx              # permission catalog
└── (institutional)/
    ├── layout.tsx                        # sidebar shell + logout
    ├── dashboard/page.tsx                # /auth/me summary
    ├── profile/page.tsx                  # /person/me view + edit
    ├── sessions/page.tsx                 # /auth/sessions (paginated)
    └── people/
        ├── page.tsx                      # list (own institution)
        ├── new/page.tsx                  # create
        └── [personId]/
            ├── page.tsx                  # detail + delete dialog
            ├── edit/page.tsx
            └── roles/page.tsx
```

The person delete flow is a confirmation dialog rendered inside `people/[personId]/page.tsx`, not a separate route. The dialog explains that the person will be disabled and their active sessions revoked.

The institutional `people` section mirrors the platform one but scopes to the caller's own institution (the institution id comes from the JWT, resolved server-side).

## Features And Endpoint Mapping

### Platform (`PLATFORM_ADMIN`)

The platform admin has god mode: the backend's permission aspect and institution caller guard bypass all checks for `PLATFORM_ADMIN`, so the admin can manage people and roles of any institution.

| Screen | Endpoint |
|---|---|
| Login, logout, refresh | `POST /auth/platform/login`, `POST /auth/platform/logout`, `POST /auth/platform/refresh` |
| List institutions | `GET /institutions` (paginated) |
| Institution detail | `GET /institutions/{id}` |
| Create institution | `POST /institutions` |
| Edit institution | `PUT /institutions/{id}` |
| Bootstrap first authority | `POST /platform/institutions/{id}/authority/{personId}` |
| List people | `GET /institutions/{id}/people?search=&page=&size=` |
| Person detail | `GET /institutions/{id}/people/{personId}` |
| Create person | `POST /institutions/{id}/people` |
| Edit person | `PUT /institutions/{id}/people/{personId}` |
| Delete person (soft) | `DELETE /institutions/{id}/people/{personId}` |
| Person roles | `GET /institutions/{id}/people/{personId}/roles` |
| Assign role | `POST /institutions/{id}/people/{personId}/roles` |
| Revoke role | `DELETE /institutions/{id}/people/{personId}/roles/{roleCode}` |
| System roles catalog (for `initialRole`) | `GET /roles/system` |
| Permission catalog | `GET /permissions` |

The bootstrap first authority endpoint is only needed for the first authority of an institution that has none yet. Once an institution has an authority, the platform admin can create further people directly with `initialRole = INSTITUTIONAL_AUTHORITY` through `POST /institutions/{id}/people`, which accepts `initialRole` as a `SystemRoleCode` and defaults to `APPLICANT`.

### Institutional

Institutional authorities (`INSTITUTIONAL_AUTHORITY`) manage people and roles of their own institution. The backend's `InstitutionalCallerGuard` enforces that the caller's institution matches the path institution.

| Screen | Endpoint | Permission |
|---|---|---|
| Self-register | `POST /auth/register` | public |
| Login, logout, refresh | `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh` | authenticated |
| My profile (view, edit) | `GET /person/me`, `PUT /person/me` | `INSTITUTION_PERSON_READ_OWN`, `INSTITUTION_PERSON_UPDATE_OWN` |
| My active sessions | `GET /auth/sessions` | authenticated |
| List, detail, create, edit, delete people | `/institutions/{own}/people/*` | `READ_ANY`, `CREATE`, `UPDATE_ANY`, `DELETE` |
| Person roles (list, assign, revoke) | `/institutions/{own}/people/{pid}/roles/*` | `ROLE_ASSIGN` or `ROLE_REVOKE` |
| System roles catalog | `GET /roles/system` | `ROLE_ASSIGN` |

Applicants (`APPLICANT`) can only view and edit their own profile. They do not see the people section.

### Public

Institution and location browsing for the login and register flows: `GET /institutions` and `GET /countries`, `/provinces`, `/cities` power the institution selector on institutional login and the country, province, city picker on the institution form.

## Forms And Mutations

- No `react-hook-form`. Forms use shadcn `Field`, `FieldGroup`, `FieldLabel`, and `Input` with React 19 `useActionState` and Server Actions. `zod` validates server-side inside the action before calling the backend.
- Server Actions live in `features/<slice>/actions.ts`. They call `serverFetch`, then `revalidatePath` or `revalidateTag` on success, and `redirect` when the action changes route.
- Backend validation errors (HTTP 400 with `fieldErrors`) are mapped back to the form: each field gets `aria-invalid` and the backend's Spanish message under the field.
- TanStack Query is used only for: debounced search of countries, provinces, and cities in the institution form's location picker; search and live pagination of the people list; live pagination of the sessions list. Everything else is RSC with `revalidatePath` after mutations. For the people and sessions lists, the page remains a Server Component (it does the auth check and renders the shell), but the list itself is a client component using TanStack Query with `clientFetch`. The initial query is prefetched on the server and passed as `initialData` to hydrate the client query, so the first render is server-side and subsequent search and page changes happen client-side without navigation.

## Dependencies And Components

### Packages to install

- `@tanstack/react-query` for the few client-side queries.
- `sonner` (added via shadcn) for toast notifications on mutation success and error.

Not installed in v1: `react-hook-form`, `axios`, `next-auth`, `next-themes`. Dark mode is deferred.

### shadcn primitives to add

Added via `pnpm dlx shadcn@latest add` as each slice needs them:

`card`, `input`, `label`, `field`, `select`, `table`, `dialog`, `sonner`, `badge`, `dropdown-menu`, `avatar`, `skeleton`, `separator`, `tabs`, `tooltip`, `sidebar`.

`button` is already installed.

## Error Handling

- **401 `TOKEN_EXPIRED`**: the BFF proxy performs one transparent refresh and retries. If the refresh fails because of reuse, revocation, or invalidity, the proxy clears all auth cookies and returns 401. The client redirects to `/login?next=<current path>`.
- **400 validation**: `fieldErrors` are placed under each field with `aria-invalid` and the backend's Spanish message.
- **403 forbidden**: a dedicated page explains the user lacks permission, with a link back to their dashboard or the institutions list.
- **409 last authority**: deleting a person who is the last `INSTITUTIONAL_AUTHORITY` of an institution, or revoking the last authority role, returns `LastInstitutionalAuthorityDeletionException`. The frontend shows a toast: "No se puede eliminar o revocar la última autoridad de la institución."
- **`PersonAlreadyExistsException`**: creating a person with a document number that already exists in the institution maps to a field error on `documentNumber`: "Ya existe una persona con ese documento en esta institución."
- **410 institution inactive**: the institution detail page shows an empty state explaining the institution is no longer active.
- **Soft delete communication**: the delete person dialog states "La persona será deshabilitada, no podrá iniciar sesión y sus sesiones activas se cerrarán." rather than implying permanent deletion.
- **Unexpected errors**: the `error.tsx` boundary shows a retry button. Toasts surface mutation failures.

## Data Layer Details

### `lib/api/errors.ts`

Defines `ApiError` with `status`, `message`, `fieldErrors?` (a `Record<string, string>`), and a best-effort `code` derived from the 401 message text since the backend does not return a separate code field. Known 401 messages are mapped to codes `TOKEN_EXPIRED`, `TOKEN_INVALID`, `TOKEN_BLACKLISTED`, `TOKEN_SESSION_INACTIVE`, `TOKEN_MISSING`, `INVALID_CREDENTIALS`, `REFRESH_TOKEN_INVALID`, `REFRESH_TOKEN_REUSE`.

### `lib/api/pagination.ts`

`PaginatedResponse<T> = { items: T[]; page: number; size: number; totalItems: number; totalPages: number }`. Query params sent to the backend use Spring's `page` (0-based), `size`, and `sort` (e.g. `sort=lastName,asc`).

### `lib/api/server-fetch.ts`

`serverFetch<T>(path: string, init?: RequestInit): Promise<T>` reads cookies via `next/headers`, attaches `Authorization: Bearer <access>`, calls `${API_URL}/api/v1${path}`, parses JSON, and on a 401 `TOKEN_EXPIRED` calls the auth refresh helper and retries once. Exports `apiGet`, `apiPost`, `apiPut`, `apiDelete` wrappers.

### `lib/api/client-fetch.ts`

`clientFetch<T>(path: string, init?: RequestInit): Promise<T>` does a relative fetch to `/api${path}` so the browser sends the httpOnly cookies automatically. Used by TanStack Query hooks in `features/locations`, `features/people`, and `features/sessions`.

## Backend Constraints Reflected In The UI

- Document numbers must be exactly 8 numeric digits. The create and edit person forms enforce this in zod and show the backend's message on failure.
- Name fields are 3 to 255 characters, letters and spaces only.
- Passwords are 8 to 255 characters. Only the create person form sets the password (the platform admin or authority sets the initial password). There is no password change endpoint.
- The person list filters out soft-deleted people (`deleted = false`). There is no restore endpoint, so the UI does not offer one.
- Role changes do not revoke sessions; permissions are resolved live from the database on each request, so the UI reflects role changes immediately without a re-login.
- The institution list only returns active institutions. The detail endpoint throws 410 for inactive ones.
- There is no endpoint to list platform accounts, so the platform admin has no "platform users" screen.

## Out Of Scope

These are not exposed by the backend and therefore not built in v1:

- Password reset, email verification, and "forgot my password" flows.
- A toggle to enable or disable a user. The soft delete disables the user internally, but there is no endpoint to re-enable.
- Listing platform admin accounts.
- `Student`, `GuardianProfile`, and `Address` management. The entities exist in the database but have no controllers.
- Backend CORS configuration. The BFF makes this unnecessary for v1.
- Automated testing (Vitest, React Testing Library, Playwright). Deferred to after v1.
- Dark mode (`next-themes` and a toggle). The tokens are already in `globals.css` but the provider and toggle are deferred to after v1.

## Verification

Implementation should be verified by:

- `pnpm lint` and `pnpm build` passing locally or inside the development container.
- `make dev` reaching `localhost:3000`.
- Manual end-to-end flow against a running boero-api on the `feat/platform-admin-people-management` branch with its dev seed data:
  - Platform login as `admin@plataforma.com` / `admin123`.
  - List institutions, open the seeded Felipe Boero institution, list its people.
  - Create a person with `initialRole = INSTITUTIONAL_AUTHORITY`, edit them, delete them (soft), and confirm the last-authority protection toast when deleting the only remaining authority.
  - Assign and revoke a role on a person.
  - Institutional login as document `12345678` / institution Felipe Boero / password `12345678`.
  - View and edit the own profile, list active sessions.
- Confirming the BFF refresh flow: let the access token expire, confirm the next request refreshes transparently and retries without a redirect to login.
- Confirming reuse detection: tamper with the refresh cookie value and confirm the next request clears cookies and redirects to login.
