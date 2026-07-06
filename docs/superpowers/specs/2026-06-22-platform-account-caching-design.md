# Platform Account Caching Design

**Date:** 2026-06-22
**Status:** Approved
**Scope:** `platform-auth` feature only. Institutional auth will replicate this pattern in a future iteration.

## Problem

`getPlatformAccount()` uses `cache: "no-store"` and has no `React.cache()` wrapper. Every server component that needs account data issues a fresh `GET /api/v1/auth/platform/me` request to the backend on every render. There is no TanStack Query, no auth provider, and no layout-level fetch to share the account across the route tree. As CRUDs, forms, and interactive selects are added, client components will need the `platformAccountId` without prop-drilling or duplicate fetches.

## Goals

1. Cache the platform account so navigation within `/platform/*` does not refetch `/me` on every page.
2. Expose the account to client components via a typed, dedicated hook.
3. Implement logout (POST `/auth/platform/logout`) with cache invalidation.
4. Keep tokens httpOnly — never expose them to the client.
5. Leave the door open for automatic refresh-token logic in a future iteration without changing the hook/action/provider API.

## Non-Goals

- Institutional auth caching (future iteration, same pattern).
- Automatic refresh-token logic (designed here, implemented later).
- Client-side access to raw tokens.

## Architecture

### Layers (bottom-up)

1. **Service** (`get-platform-account.service.ts`) — server-only. Reads the httpOnly cookie, fetches `/me`. Wrapped in `React.cache()` to deduplicate calls within a single request render pass. In a future iteration, this is where refresh-token retry logic lives; the signature stays the same.

2. **Server action proxy** (`get-platform-account.action.ts`) — `"use server"` wrapper that calls the service. This is the `queryFn` for TanStack Query. Keeps the token-reading server-side; the client never sees cookies.

3. **Hook** (`use-platform-account.hook.ts`) — `useQuery({ queryKey: ['platform-account'], queryFn: getPlatformAccountAction, staleTime: 5 * 60 * 1000 })`. Returns `{ account, isLoading, isError }`. Reads from the shared QueryClient cache, so multiple client components calling the hook share one cache entry.

4. **Provider** (`platform-account-provider.tsx`, client component) — receives `initialAccount: PlatformAccount` as a prop and hydrates the query cache via `useQuery({ ..., initialData: initialAccount })`. Mounts inside the `/platform` layout. Because TanStack caches by query key, any client component below calling `usePlatformAccount()` reads the same hydrated cache — no extra fetch on first paint.

5. **QueryClientProvider** (`src/app/providers.tsx`) — wraps the root layout. Creates `QueryClient` via `useState` (per-render instance, per TanStack SSR guidance). Global defaults: `staleTime: 5 * 60 * 1000`, `refetchOnWindowFocus: false`.

### Data flow

```
Server render:
  /platform/layout.tsx (server)
    -> getPlatformAccount()  [React.cache dedupes within request]
    -> if null: redirect("/auth/platform/login")
    -> <PlatformAccountProvider initialAccount={account}>
         -> useQuery({ initialData: account })  [populates cache]
           -> children (server + client)

Client navigation within /platform/*:
  Client component
    -> usePlatformAccount()
      -> useQuery({ queryKey: ['platform-account'] })
        -> cache hit (within staleTime) -> no fetch
        -> cache stale (after 5 min) -> queryFn -> getPlatformAccountAction (server action) -> service -> /me
```

### Auth gate

The `/platform/layout.tsx` server component fetches the account and redirects to `/auth/platform/login` if null. This means:
- All pages under `/platform/*` are protected by default.
- The provider and hook can assume `account` is non-null.
- New pages don't need to remember to add the check.

The `/auth/platform/login` page keeps its existing inverse check (if already logged in, redirect to dashboard) in the page itself.

## Files

### New files

| File | Purpose |
|---|---|
| `src/app/providers.tsx` | Client component. `QueryClientProvider` + global defaults. |
| `src/features/platform-auth/actions/get-platform-account.action.ts` | `"use server"` proxy calling the service. Used as `queryFn`. |
| `src/features/platform-auth/actions/platform-logout.action.ts` | `"use server"`. Calls logout service, clears cookies, redirects to login. |
| `src/features/platform-auth/services/logout-platform-account.service.ts` | Server-only. POST `/auth/platform/logout` with bearer token. No-throw on 401. |
| `src/features/platform-auth/hooks/use-platform-account.hook.ts` | `useQuery` wrapper. Query key `['platform-account']`, `staleTime: 5 min`. |
| `src/features/platform-auth/hooks/use-logout-platform.hook.ts` | `useMutation` wrapper. Cancels queries, clears cache, calls server action. |
| `src/features/platform-auth/components/platform-account-provider.tsx` | Client component. Receives `initialAccount`, hydrates query cache, renders children. |
| `src/features/platform-auth/utils/platform-account-keys.util.ts` | Query keys factory: `platformAccountKeys = { all: ['platform-account'] }`. |

### Edited files

| File | Change |
|---|---|
| `src/app/layout.tsx` | Wrap `<TooltipProvider>` with `<Providers>`. |
| `src/app/platform/layout.tsx` | Fetch account, gate redirect, render `<PlatformAccountProvider>`. |
| `src/features/platform-auth/services/get-platform-account.service.ts` | Wrap exported function with `React.cache()`. |
| `src/features/platform-auth/utils/platform-auth-cookies.util.ts` | Add `clearPlatformAuthCookies()` to delete both cookies. |

### New dependency

`@tanstack/react-query` (not yet installed).

## Logout flow

```
Client component
  -> useLogoutPlatform().mutate()
    -> onMutate: cancelQueries(['platform-account']), setQueryData(null)
    -> mutationFn: logoutPlatform()  ["use server" action]
      -> logoutPlatformAccount()  [service: POST /auth/platform/logout]
      -> clearPlatformAuthCookies()  [delete both cookies]
      -> redirect("/auth/platform/login")
    -> onSettled: removeQueries(['platform-account'])
```

The server action handles the redirect, so the client hook does not need to navigate after mutation.

## Refresh-token logic (future iteration — not implemented now)

When the access token (15 min TTL) expires and `/me` returns 401, the service should:
1. Read the refresh token from cookies.
2. POST `/auth/platform/refresh` to obtain a new access token.
3. Set the new access token cookie.
4. Retry `/me` once.

This logic lives entirely inside `get-platform-account.service.ts`. The server action, hook, and provider do not change — they keep calling the service and receiving either `PlatformAccount` or `null`. If refresh fails, the service returns `null` and the layout gate redirects to login.

A `logout-platform-account.service.ts` call against an expired token should not throw — it clears cookies regardless of the backend response.

## Query keys

```ts
export const platformAccountKeys = {
  all: ['platform-account'] as const,
};
```

Used for `invalidateQueries`, `removeQueries`, `cancelQueries`, and `setQueryData` across the hook and logout mutation.

## Configuration

| Setting | Value | Rationale |
|---|---|---|
| `staleTime` (global + account query) | 5 min | Access token lives 15 min; 5 min keeps data fresh without hammering `/me` on every navigation. |
| `refetchOnWindowFocus` | false | Avoid `/me` round-trip on every tab refocus. |
| `retry` (account query) | 1 | One retry on transient failure; don't hammer on auth failures. |
| `cache: "no-store"` (service fetch) | unchanged | Keep server fetch fresh; `React.cache()` handles request-level dedup. |

## Type contract

```ts
// Existing
type PlatformAccount = {
  platformAccountId: string;
  email: string;
  name: string;
  lastName: string;
};

// usePlatformAccount() returns
{
  account: PlatformAccount;       // non-null within /platform/* (gate guarantees)
  isLoading: boolean;
  isError: boolean;
}
```

Outside `/platform/*` (e.g., if a client component calls the hook without the provider), `account` may be `null` and the component should handle that case. The hook's return type is `PlatformAccount | null`.

## Migration

1. Install `@tanstack/react-query`.
2. Create `providers.tsx` and wrap root layout.
3. Add `React.cache()` to `get-platform-account.service.ts`.
4. Create the server action, hooks, provider, query keys, logout service/action.
5. Add `clearPlatformAuthCookies()` util.
6. Edit `platform/layout.tsx` to fetch + gate + render provider.
7. `dashboard/page.tsx` keeps working — it already calls `getPlatformAccount()` directly (server component). The `React.cache()` ensures it shares the same fetch as the layout within the same request.
8. Add a logout button to the dashboard as the first consumer of `useLogoutPlatform()` (manual verification).

## Testing

- Manual: log in, navigate between `/platform/*` pages, confirm `/me` is not called on each navigation (check network tab). Wait 5 min, confirm background refetch.
- Manual: click logout, confirm POST to `/auth/platform/logout`, cookies cleared, redirect to login, back button does not show dashboard.
- Manual: clear access token cookie manually, navigate to `/platform/dashboard`, confirm redirect to login.

Automated tests deferred until a test framework is in place (none currently configured).
