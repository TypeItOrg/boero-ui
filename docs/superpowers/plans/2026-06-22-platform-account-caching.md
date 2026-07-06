# Platform Account Caching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cache the platform account via TanStack Query + `React.cache()` so navigation within `/platform/*` doesn't refetch `/me` on every page, expose it to client components via a typed hook, and implement logout with cache invalidation.

**Architecture:** Server-side `React.cache()` deduplicates the `/me` fetch within a request. The `/platform` layout fetches the account server-side, gates unauthenticated users, and hydrates a TanStack Query cache via a client `PlatformAccountProvider`. Client components read from the shared cache via `usePlatformAccount()`. A server action proxies the service as the query function, keeping httpOnly tokens off the client. Logout is a `useMutation` that clears the cache and calls a server action which POSTs `/auth/platform/logout`, clears cookies, and redirects.

**Tech Stack:** Next.js 16 App Router, React 19, TanStack Query v5, TypeScript, httpOnly cookies.

## Global Constraints

- Package manager: `pnpm@11.8.0`
- Path aliases: `@app/*`, `@features/*`, `@common/*`, `@/*` (see `tsconfig.json`)
- API base: `process.env.BOERO_API_URL ?? "http://172.17.0.1:8080"` (match existing service)
- Cookies: `platform_access_token`, `platform_refresh_token` — httpOnly, sameSite lax, secure in prod
- No test framework configured — verification is manual via the dev server and browser network tab
- Do not commit; user handles commits
- `eslint` and `next build` must pass after each task
- Lint command: `pnpm lint`
- Typecheck/build command: `pnpm build`

---

## File Structure

| File | Responsibility | Status |
|---|---|---|
| `src/features/platform-auth/utils/platform-account-keys.util.ts` | Query key factory for the account query | Create |
| `src/features/platform-auth/services/get-platform-account.service.ts` | Server-only `/me` fetch, `React.cache()`-wrapped | Modify |
| `src/features/platform-auth/services/logout-platform-account.service.ts` | Server-only POST `/auth/platform/logout` | Create |
| `src/features/platform-auth/utils/platform-auth-cookies.util.ts` | Add `clearPlatformAuthCookies()` | Modify |
| `src/features/platform-auth/actions/get-platform-account.action.ts` | `"use server"` proxy used as queryFn | Create |
| `src/features/platform-auth/actions/platform-logout.action.ts` | `"use server"` logout + cookie clear + redirect | Create |
| `src/features/platform-auth/hooks/use-platform-account.hook.ts` | `useQuery` wrapper, account query | Create |
| `src/features/platform-auth/hooks/use-logout-platform.hook.ts` | `useMutation` wrapper, logout with cache cleanup | Create |
| `src/features/platform-auth/components/platform-account-provider.tsx` | Client provider hydrating cache with `initialData` | Create |
| `src/app/providers.tsx` | Client `QueryClientProvider` + global defaults | Create |
| `src/app/layout.tsx` | Wrap tree with `<Providers>` | Modify |
| `src/app/platform/layout.tsx` | Fetch account, gate redirect, render provider | Modify |
| `src/app/platform/dashboard/page.tsx` | Add logout button consuming `useLogoutPlatform()` | Modify |

---

### Task 1: Install TanStack Query

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Consumes: nothing
- Produces: `@tanstack/react-query` v5 installed and importable

- [ ] **Step 1: Install the dependency**

Run:
```bash
pnpm add @tanstack/react-query
```

- [ ] **Step 2: Verify it resolves**

Run:
```bash
pnpm build
```
Expected: build succeeds (no new errors).

- [ ] **Step 3: Verify lint**

Run:
```bash
pnpm lint
```
Expected: no errors.

---

### Task 2: Query keys factory

**Files:**
- Create: `src/features/platform-auth/utils/platform-account-keys.util.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `platformAccountKeys` object with `all` and `details()` keys (extensible for future per-id queries)

- [ ] **Step 1: Create the file**

```ts
export const platformAccountKeys = {
  all: ["platform-account"] as const,
};
```

- [ ] **Step 2: Verify typecheck**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 3: Wrap `getPlatformAccount` with `React.cache()`

**Files:**
- Modify: `src/features/platform-auth/services/get-platform-account.service.ts`

**Interfaces:**
- Consumes: `PLATFORM_ACCESS_TOKEN_COOKIE`, `PlatformAccount`
- Produces: `getPlatformAccount(): Promise<PlatformAccount | null>` — same signature, now request-deduped

- [ ] **Step 1: Edit the file**

Replace the file content with:

```ts
import { cache } from "react";
import { cookies } from "next/headers";

import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";
import { PLATFORM_ACCESS_TOKEN_COOKIE } from "@features/platform-auth/utils/platform-auth-cookies.util";

const API_URL = process.env.BOERO_API_URL ?? "http://172.17.0.1:8080";

async function fetchPlatformAccount(): Promise<PlatformAccount | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) return null;

  const response = await fetch(`${API_URL}/api/v1/auth/platform/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as { account: PlatformAccount };
  return payload.account;
}

export const getPlatformAccount = cache(fetchPlatformAccount);
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 4: Add `clearPlatformAuthCookies()` util

**Files:**
- Modify: `src/features/platform-auth/utils/platform-auth-cookies.util.ts`

**Interfaces:**
- Consumes: existing cookie name constants
- Produces: `clearPlatformAuthCookies(): Promise<void>` — deletes both auth cookies

- [ ] **Step 1: Append the new function**

Add at the end of the file:

```ts
export async function clearPlatformAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(PLATFORM_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(PLATFORM_REFRESH_TOKEN_COOKIE);
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 5: Logout service

**Files:**
- Create: `src/features/platform-auth/services/logout-platform-account.service.ts`

**Interfaces:**
- Consumes: `PLATFORM_ACCESS_TOKEN_COOKIE` from cookies util
- Produces: `logoutPlatformAccount(): Promise<void>` — POSTs `/auth/platform/logout`, swallows errors (token may already be expired)

- [ ] **Step 1: Create the file**

```ts
import { cookies } from "next/headers";

import { PLATFORM_ACCESS_TOKEN_COOKIE } from "@features/platform-auth/utils/platform-auth-cookies.util";

const API_URL = process.env.BOERO_API_URL ?? "http://172.17.0.1:8080";

export async function logoutPlatformAccount(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) return;

  try {
    await fetch(`${API_URL}/api/v1/auth/platform/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    // Token may be expired or backend unreachable — still clear cookies locally.
  }
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 6: Get-account server action proxy

**Files:**
- Create: `src/features/platform-auth/actions/get-platform-account.action.ts`

**Interfaces:**
- Consumes: `getPlatformAccount` from service (Task 3)
- Produces: `getPlatformAccountAction(): Promise<PlatformAccount | null>` — server action, used as `queryFn`

- [ ] **Step 1: Create the file**

```ts
"use server";

import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export async function getPlatformAccountAction() {
  return getPlatformAccount();
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 7: Logout server action

**Files:**
- Create: `src/features/platform-auth/actions/platform-logout.action.ts`

**Interfaces:**
- Consumes: `logoutPlatformAccount` (Task 5), `clearPlatformAuthCookies` (Task 4)
- Produces: `logoutPlatform(): Promise<never>` — calls service, clears cookies, redirects to login (never returns due to redirect)

- [ ] **Step 1: Create the file**

```ts
"use server";

import { redirect } from "next/navigation";

import { logoutPlatformAccount } from "@features/platform-auth/services/logout-platform-account.service";
import { clearPlatformAuthCookies } from "@features/platform-auth/utils/platform-auth-cookies.util";

export async function logoutPlatform(): Promise<never> {
  await logoutPlatformAccount();
  await clearPlatformAuthCookies();
  redirect("/auth/platform/login");
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 8: `usePlatformAccount` hook

**Files:**
- Create: `src/features/platform-auth/hooks/use-platform-account.hook.ts`

**Interfaces:**
- Consumes: `useQuery` from `@tanstack/react-query`, `getPlatformAccountAction` (Task 6), `platformAccountKeys` (Task 2), `PlatformAccount` type
- Produces: `usePlatformAccount(options?)` returning `{ account, isLoading, isError }` where `account` is `PlatformAccount | null`. Accepts optional `initialData` for hydration.

- [ ] **Step 1: Create the file**

```ts
"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getPlatformAccountAction } from "@features/platform-auth/actions/get-platform-account.action";
import { platformAccountKeys } from "@features/platform-auth/utils/platform-account-keys.util";
import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";

type UsePlatformAccountOptions = Pick<
  UseQueryOptions<PlatformAccount | null>,
  "initialData" | "enabled"
>;

export function usePlatformAccount(options: UsePlatformAccountOptions = {}) {
  const query = useQuery<PlatformAccount | null>({
    queryKey: platformAccountKeys.all,
    queryFn: getPlatformAccountAction,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });

  return {
    account: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 9: `useLogoutPlatform` hook

**Files:**
- Create: `src/features/platform-auth/hooks/use-logout-platform.hook.ts`

**Interfaces:**
- Consumes: `useMutation`, `useQueryClient` from `@tanstack/react-query`, `logoutPlatform` action (Task 7), `platformAccountKeys` (Task 2)
- Produces: `useLogoutPlatform()` returning a mutation object (`mutate()`, `isPending`, etc.)

- [ ] **Step 1: Create the file**

```ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logoutPlatform } from "@features/platform-auth/actions/platform-logout.action";
import { platformAccountKeys } from "@features/platform-auth/utils/platform-account-keys.util";

export function useLogoutPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutPlatform(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: platformAccountKeys.all });
      queryClient.setQueryData(platformAccountKeys.all, null);
    },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: platformAccountKeys.all });
    },
  });
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 10: `PlatformAccountProvider` client component

**Files:**
- Create: `src/features/platform-auth/components/platform-account-provider.tsx`

**Interfaces:**
- Consumes: `usePlatformAccount` (Task 8), `PlatformAccount` type
- Produces: `<PlatformAccountProvider initialAccount={account}>` — hydrates the query cache and renders children. Within `/platform/*`, `account` is non-null (the layout gate guarantees it).

- [ ] **Step 1: Create the file**

```tsx
"use client";

import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";
import { usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

type PlatformAccountProviderProps = {
  initialAccount: PlatformAccount;
  children: React.ReactNode;
};

export function PlatformAccountProvider({
  initialAccount,
  children,
}: PlatformAccountProviderProps) {
  usePlatformAccount({ initialData: initialAccount });
  return <>{children}</>;
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 11: Root `Providers` with `QueryClientProvider`

**Files:**
- Create: `src/app/providers.tsx`

**Interfaces:**
- Consumes: `QueryClient`, `QueryClientProvider` from `@tanstack/react-query`
- Produces: `<Providers>{children}</Providers>` — wraps the app with a per-render `QueryClient` and sensible global defaults

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 12: Wrap root layout with `<Providers>`

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Providers` (Task 11)
- Produces: app tree wrapped by QueryClientProvider

- [ ] **Step 1: Edit `src/app/layout.tsx`**

Add the import alongside the existing imports:

```ts
import { Providers } from "@app/providers";
```

Replace the body line:
```tsx
<TooltipProvider>{children}</TooltipProvider>
```
with:
```tsx
<Providers>
  <TooltipProvider>{children}</TooltipProvider>
</Providers>
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 13: `/platform` layout — fetch, gate, render provider

**Files:**
- Modify: `src/app/platform/layout.tsx`

**Interfaces:**
- Consumes: `getPlatformAccount` (Task 3), `PlatformAccountProvider` (Task 10), `redirect` from `next/navigation`
- Produces: `/platform/*` routes are auth-gated and have the account cache hydrated

- [ ] **Step 1: Replace the file**

```tsx
import { redirect } from "next/navigation";

import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { PlatformAccountProvider } from "@features/platform-auth/components/platform-account-provider";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const account = await getPlatformAccount();
  if (!account) redirect("/auth/platform/login");

  return (
    <main className="bg-muted min-h-svh p-6 md:p-10">
      <PlatformAccountProvider initialAccount={account}>{children}</PlatformAccountProvider>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

---

### Task 14: Add logout button to dashboard

**Files:**
- Modify: `src/app/platform/dashboard/page.tsx`
- Create: `src/app/platform/dashboard/logout-button.tsx`

**Interfaces:**
- Consumes: `useLogoutPlatform` (Task 9), existing `Button` from `@common/components/ui/button` (verify path)
- Produces: a visible logout button on the dashboard that clears the cache, POSTs the backend, and redirects to login

- [ ] **Step 1: Check the button component path**

Run:
```bash
ls src/common/components/ui/button.tsx
```
If missing, locate it via `glob` and adjust the import path in Step 3.

- [ ] **Step 2: Create `src/app/platform/dashboard/logout-button.tsx`**

```tsx
"use client";

import { LogOut } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { useLogoutPlatform } from "@features/platform-auth/hooks/use-logout-platform.hook";

export function LogoutButton() {
  const logout = useLogoutPlatform();

  return (
    <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
      <LogOut className="mr-2 h-4 w-4" />
      {logout.isPending ? "Cerrando sesión…" : "Cerrar sesión"}
    </Button>
  );
}
```

- [ ] **Step 3: Edit `src/app/platform/dashboard/page.tsx`**

Add imports at the top:
```ts
import { LogoutButton } from "./logout-button";
```

Inside `<CardContent className="space-y-4">`, after the `<dl>...</dl>` block, add:
```tsx
<LogoutButton />
```

- [ ] **Step 4: Verify build**

Run:
```bash
pnpm build
```
Expected: success.

- [ ] **Step 5: Verify lint**

Run:
```bash
pnpm lint
```
Expected: no errors.

---

### Task 15: Manual verification

No test framework is configured; verify by running the app against the backend.

- [ ] **Step 1: Start dev server**

Run:
```bash
pnpm dev
```

- [ ] **Step 2: Login flow**

- Go to `http://localhost:3000/auth/platform/login`, log in.
- Confirm redirect to `/platform/dashboard`.
- Open DevTools → Network. Confirm exactly one `GET .../auth/platform/me` request for the dashboard navigation.

- [ ] **Step 3: Cache behavior**

- From the dashboard, navigate to another `/platform/*` route (if none exist yet, reload the dashboard — should hit TanStack cache, not refetch within staleTime).
- Confirm no extra `/me` calls within 5 minutes.

- [ ] **Step 4: Logout flow**

- Click "Cerrar sesión".
- Confirm a `POST .../auth/platform/logout` request fires.
- Confirm redirect to `/auth/platform/login`.
- Press the browser back button — confirm you are redirected back to login (not the dashboard).

- [ ] **Step 5: Expired-token gate**

- In DevTools → Application → Cookies, delete `platform_access_token`.
- Navigate to `/platform/dashboard`.
- Confirm redirect to `/auth/platform/login`.

- [ ] **Step 6: Final lint + build**

Run:
```bash
pnpm lint && pnpm build
```
Expected: both succeed with no errors.
