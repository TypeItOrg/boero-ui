# Institution user count column + context-menu actions

Date: 2026-07-08
Status: Approved

## Context

The platform admin institutions table (`/platform/institutions`) currently shows columns: Nombre, País, Provincia, Ciudad, Estado, Acciones. There is no signal of how many users each institution has. Row actions (Usuarios, Editar) are exposed only via a three-dots dropdown that is always visible on all breakpoints.

The existing `GET /api/v1/institutions` endpoint is **public** (`permitAll`, see `PublicRoutes.java` and `SecurityConfig.java`). Exposing per-institution user counts there would leak business intel (adoption/dimensioning) to anonymous callers — scrapers, competitors, OSINT — with no authentication.

## Goals

1. Show an enabled-user count per institution in the platform admin table, without exposing it to anonymous callers.
2. Replace the always-visible three-dots button on desktop with a right-click context menu, keeping the three-dots button for mobile.
3. Render up to 3 stacked user avatars + a `+N` overflow indicator as the visual representation of the count.

## Non-goals (YAGNI)

- Do NOT modify the public `GET /api/v1/institutions` endpoint, its DTOs, or its use case.
- Do NOT modify `GET /api/v1/institutions/{id}` (detail).
- Do NOT add a delete institution action (does not exist today, not requested).
- Do NOT migrate the table to `@tanstack/react-table` (stays hand-rolled on shadcn `<Table>`).
- Do NOT add a photo/avatar URL field to `Person` (avatars use initials/icon only).
- Do NOT return real user previews (names) from the backend — backend returns only the count.
- Do NOT write frontend tests for this change.

## Backend design

### New endpoint

- **Route:** `GET /api/v1/platform/institutions` (paginated, same `Pageable` contract as the public list).
- **Security:** NOT added to `PublicRoutes`/`GET_ONLY_ROUTES`, so it falls through to `anyRequest().authenticated()` in `SecurityConfig`. Method additionally annotated `@RequiresPlatformRole(PLATFORM_ADMIN)`, enforced by `RoleAuthorizationAspect`.
  - Anonymous → 401 (standard `AuthenticationEntryPoint`).
  - Authenticated non-admin → 403 (standard `AccessDeniedHandler`).
- **Controller:** new method `listForAdmin(Pageable)` on `InstitutionController` (or a sibling admin controller if the existing one is better kept lean — decision deferred to implementation plan). Delegates to a new `ListInstitutionsAdminUseCase`.
- **Use case:** reuses `institutionRepository.findAllWithLocation(pageable)` (public query untouched), then resolves counts in a single extra grouped query.
- **Repository query (new, on `UserRepository`):**
  ```jpql
  select u.institution.id as institutionId, count(u) as userCount
  from User u
  where u.enabled = true and u.institution.id in :ids
  group by u.institution.id
  ```
  Returns a projection (`UserCountProjection` or `List<Object[]>`/record). The use case merges results into a `Map<UUID, Long>` keyed by institution id (default 0 for institutions with no enabled users) and maps to the new DTO.
  - One extra query per page — no N+1. Page size ≤ 50, so the `IN :ids` list is bounded.

### New DTO

`InstitutionAdminListItemResponse` — same fields as `InstitutionListItemResponse` plus:

```java
long userCount
```

Returned as `PaginatedResponse<InstitutionAdminListItemResponse>`.

### Affected files (backend)

- `institutional/controllers/InstitutionController.java` — new admin listing method (or new admin controller).
- `institutional/services/ListInstitutionsAdminUseCase.java` — new.
- `institutional/payloads/InstitutionAdminListItemResponse.java` — new.
- `auth/interfaces/UserRepository.java` — new count query + projection.
- `security/config/PublicRoutes.java` — UNCHANGED (route must NOT appear here).

### Tests (backend only)

- Integration test for `GET /api/v1/platform/institutions`:
  - Anonymous → 401.
  - Authenticated institution user (non-platform-admin) → 403.
  - Platform admin → 200 with `PaginatedResponse<InstitutionAdminListItemResponse>`, `userCount` matches seeded data (institutions with 0, 1, many enabled users; at least one disabled user that must NOT be counted).
- Repository test for the new grouped-count query: correct counts for a set of institution ids, including an id with no users (absent from result → default 0 in use case).

## Frontend design

### Types & service

- `InstitutionSummary` (`src/features/institutions/types/institution-summary.types.ts`) gains `userCount: number`.
- `fetch-institutions.service.ts` target changes from `/api/v1/institutions` to `/api/v1/platform/institutions`. This is the only consumer of the list endpoint (verified by grep).

### Table presentation

File: `src/features/institutions/components/institutions-table-presentation.tsx`.

- New column **"Usuarios"** between "Ciudad" and "Estado".
- Header cell: `<TableHead>Usuarios</TableHead>`.
- Body cell: `<InstitutionUsersCell institution={institution} />`.
- Shared action items array extracted (Usuarios → `/platform/institutions/${id}/people`, Editar → `/platform/institutions/${id}`) so the context menu and the mobile dropdown stay in sync.

### `InstitutionUsersCell` component

- `userCount === 0` → render `<span className="text-muted-foreground">—</span>`.
- `userCount > 0` → render an `<AvatarGroup>` containing `min(userCount, 3)` copies of:
  ```tsx
  <Avatar size="sm">
    <AvatarFallback>
      <UserIcon className="size-3" />
    </AvatarFallback>
  </Avatar>
  ```
  (`UserIcon` from `lucide-react`.)
- If `userCount > 3` → append `<AvatarGroupCount>+{userCount - 3}</AvatarGroupCount>`.
- The whole cell is wrapped in a `<Link href={`/platform/institutions/${id}/people`}>` so clicking anywhere in the cell navigates to the users page. Avatars themselves are not individually clickable (no per-user detail target).
- Uses existing primitives from `@common/components/ui/avatar` (`Avatar`, `AvatarFallback`, `AvatarGroup`, `AvatarGroupCount` already exported there).

### Skeleton

`src/features/institutions/components/institutions-table-skeleton.tsx` — add a placeholder cell in the new "Usuarios" column position to avoid layout shift.

### Context menu (desktop) + 3-dots (mobile)

- Install: `npx shadcn@latest add context-menu` (not currently installed — confirmed absent).
- Wrap each `<TableRow>` (the row element) with `<ContextMenu>` / `<ContextMenuTrigger asChild>` / `<ContextMenuContent>`:
  - Items: "Usuarios" and "Editar", reusing the shared action items array (same `<Link>` targets).
- Existing three-dots `<DropdownMenu>` (`InstitutionActionsMenu`): add `md:hidden` to the trigger wrapper/button, so it only appears on mobile. Desktop uses only right-click.
- Header cell for "Acciones": `className="w-16 pr-4 md:w-0 md:p-0"` and the sr-only label kept for mobile.
- Body actions cell: `className="pr-4 md:p-0"` with the inner menu `md:hidden`.

### Affected files (frontend)

- `src/features/institutions/types/institution-summary.types.ts`
- `src/features/institutions/services/fetch-institutions.service.ts`
- `src/features/institutions/components/institutions-table-presentation.tsx`
- `src/features/institutions/components/institutions-table-skeleton.tsx`
- `src/common/components/ui/context-menu.tsx` (new, via shadcn add)

### Tests (frontend)

None — explicitly excluded per user instruction.

## Risk & rollback

- Backend change is additive (new endpoint + new DTO); public contract unchanged. Rollback = remove the new endpoint/use case/DTO/query.
- Frontend change flips the list endpoint URL and adds a required field to `InstitutionSummary`. If deployed before the backend, the `userCount` field will be `undefined` → the cell should treat `undefined`/`NaN` as 0 defensively. Implementation must guard with `Number.isFinite`.
- Context menu depends on shadcn `context-menu` primitive being added; rollback = revert presentation file.

## Open micro-decisions (resolve in implementation plan)

- Single `InstitutionController` vs. a new admin controller — keep in the existing controller if it stays readable; split if it grows.
- Grouped-count JPQL projection style (`record` projection vs. `Object[]` mapping) — prefer a typed projection interface/record.
- Whether to format `+N` with thousands separator for very large counts (unlikely at this scale).