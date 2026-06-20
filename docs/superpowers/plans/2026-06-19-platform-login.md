# Platform Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement platform login using a Next.js Server Action, store backend tokens in `httpOnly` cookies, and render `/platform/dashboard` with the logged-in platform account from `GET /api/v1/auth/platform/me`.

**Architecture:** The login form validates obvious input in the browser and submits to a Server Action. The Server Action validates with Zod, calls the Spring backend, stores `accessToken` and `refreshToken` in secure cookies, and redirects to `/platform/dashboard`. The dashboard is a Server Component that reads the `accessToken` cookie and fetches the current account from the backend with a bearer token.

**Tech Stack:** Next.js App Router 16.2.9, React 19.2.4, TypeScript, Zod, shadcn/ui components, native `fetch`, `cookies()` and `redirect()` from Next.js.

## Global Constraints

- Do not expose `accessToken` or `refreshToken` to client-side JavaScript.
- Use `httpOnly` cookies for both backend tokens.
- Use `BOERO_API_URL` for the backend base URL, defaulting to `http://localhost:8080` during local development.
- Login success redirects to `/platform/dashboard`.
- Dashboard account data comes from `GET /api/v1/auth/platform/me`, not from duplicated account data in cookies.
- Do not add TanStack Query for login or the initial dashboard account display.
- Keep the login page as a Server Component and isolate interactive form state in a small Client Component.
- Use native browser validation plus Zod server validation.
- Run `pnpm lint` and `pnpm build` before claiming completion.

---

## File Structure

- Create `lib/platform-auth.ts`: shared server auth helpers, backend response types, cookie names, login fetch, current account fetch, and token cookie writer.
- Create `app/auth/platform/login/schema.ts`: Zod login schema and action state type.
- Create `app/auth/platform/login/actions.ts`: Server Action for platform login.
- Create `app/auth/platform/login/platform-login-form.tsx`: Client Component for the form, pending state, and inline errors.
- Modify `app/auth/platform/login/page.tsx`: keep metadata and shell, render `PlatformLoginForm` instead of embedding form controls directly.
- Create `app/platform/layout.tsx`: minimal authenticated platform layout shell.
- Create `app/platform/dashboard/page.tsx`: Server Component that fetches and displays the logged-in account.
- Optional create `.env.local.example` if the repository already tracks env examples; otherwise document `BOERO_API_URL` in the final response only.

---

### Task 1: Server Auth Helpers

**Files:**
- Create: `lib/platform-auth.ts`

**Interfaces:**
- Produces: `PLATFORM_ACCESS_TOKEN_COOKIE: "platform_access_token"`
- Produces: `PLATFORM_REFRESH_TOKEN_COOKIE: "platform_refresh_token"`
- Produces: `type PlatformAccount`
- Produces: `type PlatformLoginResult`
- Produces: `loginPlatformAccount(input: { email: string; password: string }): Promise<PlatformLoginResult>`
- Produces: `setPlatformAuthCookies(tokens: PlatformLoginResult["tokens"]): Promise<void>`
- Produces: `getPlatformAccount(): Promise<PlatformAccount | null>`

- [ ] **Step 1: Create `lib/platform-auth.ts` with backend types and helpers**

```ts
import { cookies } from "next/headers";

export const PLATFORM_ACCESS_TOKEN_COOKIE = "platform_access_token";
export const PLATFORM_REFRESH_TOKEN_COOKIE = "platform_refresh_token";

export type PlatformAccount = {
  platformAccountId: string;
  email: string;
  name: string;
  lastName: string;
};

export type PlatformLoginResult = {
  account: PlatformAccount;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

type BackendError = {
  status: number;
  message: string;
};

const apiUrl = process.env.BOERO_API_URL ?? "http://localhost:8080";

function getBackendMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

export async function loginPlatformAccount(input: {
  email: string;
  password: string;
}): Promise<PlatformLoginResult> {
  const response = await fetch(`${apiUrl}/api/v1/auth/platform/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const payload = (await response.json()) as PlatformLoginResult | BackendError;

  if (!response.ok) {
    throw new Error(getBackendMessage(payload, "No pudimos iniciar sesión."));
  }

  return payload as PlatformLoginResult;
}

export async function setPlatformAuthCookies(tokens: PlatformLoginResult["tokens"]) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(PLATFORM_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 15,
  });

  cookieStore.set(PLATFORM_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getPlatformAccount(): Promise<PlatformAccount | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${apiUrl}/api/v1/auth/platform/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { account: PlatformAccount };

  return payload.account;
}
```

- [ ] **Step 2: Verify TypeScript module resolution**

Run: `pnpm lint`

Expected: lint completes without import or type errors related to `lib/platform-auth.ts`.

---

### Task 2: Login Server Action

**Files:**
- Create: `app/auth/platform/login/schema.ts`
- Create: `app/auth/platform/login/actions.ts`

**Interfaces:**
- Consumes: `loginPlatformAccount(input)` and `setPlatformAuthCookies(tokens)` from `lib/platform-auth.ts`
- Produces: `type PlatformLoginActionState = { error?: string }`
- Produces: `loginPlatform(previousState: PlatformLoginActionState, formData: FormData): Promise<PlatformLoginActionState>`

- [ ] **Step 1: Create `app/auth/platform/login/schema.ts`**

```ts
import { z } from "zod";

export const platformLoginSchema = z.object({
  email: z.email("Ingresá un correo válido."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export type PlatformLoginActionState = {
  error?: string;
};
```

- [ ] **Step 2: Create `app/auth/platform/login/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";

import { loginPlatformAccount, setPlatformAuthCookies } from "@/lib/platform-auth";
import { platformLoginSchema, type PlatformLoginActionState } from "./schema";

export async function loginPlatform(
  _previousState: PlatformLoginActionState,
  formData: FormData,
): Promise<PlatformLoginActionState> {
  const parsed = platformLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.",
    };
  }

  try {
    const result = await loginPlatformAccount(parsed.data);
    await setPlatformAuthCookies(result.tokens);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pudimos iniciar sesión.",
    };
  }

  redirect("/platform/dashboard");
}
```

- [ ] **Step 3: Verify lint**

Run: `pnpm lint`

Expected: lint completes without action or schema errors.

---

### Task 3: Login Form Client Component

**Files:**
- Create: `app/auth/platform/login/platform-login-form.tsx`
- Modify: `app/auth/platform/login/page.tsx`

**Interfaces:**
- Consumes: `loginPlatform` from `./actions`
- Consumes: `PlatformLoginActionState` from `./schema`
- Produces: a client form with `name="email"` and `name="password"` fields for the Server Action

- [ ] **Step 1: Create `app/auth/platform/login/platform-login-form.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { loginPlatform } from "./actions";
import type { PlatformLoginActionState } from "./schema";

const initialState: PlatformLoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button variant="default" type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Ingresando..." : "Iniciar sesión"}
    </Button>
  );
}

export function PlatformLoginForm() {
  const [state, formAction] = useActionState(loginPlatform, initialState);

  return (
    <form action={formAction} className="p-6 md:p-8">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
        <p className="text-muted-foreground text-sm">
          <span className="hidden md:block">Ingresá tus credenciales para acceder a tu cuenta.</span>
          <span className="md:hidden">Ingresá tus credenciales para continuar.</span>
        </p>
      </header>

      <div className="mt-6 space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              required
            />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <PasswordInput id="password" name="password" autoComplete="current-password" required />
          </Field>
        </FieldGroup>

        {state.error ? (
          <p className="text-destructive text-sm" role="alert">
            {state.error}
          </p>
        ) : null}

        <footer className="mt-6 flex w-full flex-col gap-4">
          <SubmitButton />
        </footer>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Modify `app/auth/platform/login/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { PlatformLoginForm } from "./platform-login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en tu cuenta",
};

export default function LoginPage() {
  return (
    <Card className="p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <PlatformLoginForm />

        <section className="bg-muted relative hidden md:block">
          <Image
            alt="Login background"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            height={1200}
            loading="eager"
            priority
            src="https://ui.shadcn.com/placeholder.svg"
            width={1200}
          />
        </section>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Verify lint**

Run: `pnpm lint`

Expected: lint completes without hook, form, or import errors.

---

### Task 4: Platform Dashboard Page

**Files:**
- Create: `app/platform/layout.tsx`
- Create: `app/platform/dashboard/page.tsx`

**Interfaces:**
- Consumes: `getPlatformAccount()` from `lib/platform-auth.ts`
- Produces: `/platform/dashboard` route that redirects unauthenticated users to `/auth/platform/login`

- [ ] **Step 1: Create `app/platform/layout.tsx`**

```tsx
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <main className="bg-muted min-h-svh p-6 md:p-10">{children}</main>;
}
```

- [ ] **Step 2: Create `app/platform/dashboard/page.tsx`**

```tsx
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformAccount } from "@/lib/platform-auth";

export default async function PlatformDashboardPage() {
  const account = await getPlatformAccount();

  if (!account) {
    redirect("/auth/platform/login");
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">Usuario logueado</p>
            <h1 className="text-2xl font-semibold">
              {account.name} {account.lastName}
            </h1>
          </div>

          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{account.email}</dd>
            </div>
            <div className="rounded-lg border p-3">
              <dt className="text-muted-foreground">ID de cuenta</dt>
              <dd className="break-all font-medium">{account.platformAccountId}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
```

- [ ] **Step 3: Verify unauthenticated redirect manually**

Run: `pnpm dev`

Expected: visiting `http://localhost:3000/platform/dashboard` without cookies redirects to `/auth/platform/login`.

---

### Task 5: End-to-End Verification

**Files:**
- No new files.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified login flow from form submission to dashboard account display.

- [ ] **Step 1: Start backend and frontend**

Run backend from the sibling `boero-api` project so `http://localhost:8080/api/v1/auth/platform/login` and `http://localhost:8080/api/v1/auth/platform/me` are available.

Run frontend: `pnpm dev`

Expected: Next.js dev server starts successfully.

- [ ] **Step 2: Verify invalid browser input**

Open `http://localhost:3000/auth/platform/login`, enter `admin` in the email field, enter any password, and submit.

Expected: the browser blocks submission because `type="email"` is invalid.

- [ ] **Step 3: Verify invalid credentials backend error**

Enter a syntactically valid email with a wrong password and submit.

Expected: the page stays on `/auth/platform/login` and displays the backend message, for example `Las credenciales proporcionadas son inválidas.`

- [ ] **Step 4: Verify successful login**

Enter valid platform credentials and submit.

Expected: the app redirects to `/platform/dashboard` and shows `name`, `lastName`, `email`, and `platformAccountId` from `GET /api/v1/auth/platform/me`.

- [ ] **Step 5: Run static verification**

Run: `pnpm lint`

Expected: lint passes.

Run: `pnpm build`

Expected: production build passes.

---

## Self-Review

- Spec coverage: login submit, backend error handling, `httpOnly` cookies, redirect to `/platform/dashboard`, and account display through `/api/v1/auth/platform/me` are covered.
- Placeholder scan: no `TBD`, `TODO`, deferred implementation, or unspecified error handling remains.
- Type consistency: `PlatformAccount`, `PlatformLoginResult`, `PlatformLoginActionState`, `loginPlatformAccount`, `setPlatformAuthCookies`, `getPlatformAccount`, and `loginPlatform` are defined before use and referenced consistently.
- Scope check: refresh-token rotation and logout are intentionally out of scope for this first login/dashboard slice.
