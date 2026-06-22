# Vertical Slicing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Note:** This plan was executed with a late refinement: the `services/` folder was removed in favor of `utils/`, shared helpers like `getBackendMessage` moved to `common/lib/`, and the layer suffix uses dots (e.g. `*.schema.ts`, `*.action.ts`, `*.util.ts`). See the final state in `docs/superpowers/specs/2026-06-22-vertical-slicing-design.md`.

**Goal:** Reorganizar `boero-ui` en una arquitectura de vertical slicing con `src/app/` para routing, `src/features/<feature>/` para dominio y `src/common/` para código compartido.

**Architecture:** Mover toda la aplicación bajo `src/`, separar las features `platform-auth` e `institutional-auth` en slices verticales con sus propios componentes, schemas, actions, types y utils, y centralizar componentes UI/utilidades en `src/common/`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod 4, Tailwind CSS, shadcn/ui.

## Global Constraints

- Cada archivo debe tener una única responsabilidad clara.
- Tipos/interfaces: una definición por archivo.
- Nombres de archivos con sufijo por capa (dot-separated): `.schema.ts`, `.action.ts`, `.types.ts`, `.util.ts`, `-form.tsx`.
- Sin carpeta `services`: preferir `utils/` con archivos específicos.
- Helpers compartidos (como `getBackendMessage`) van en `common/lib/`.
- `src/app/` solo contiene routing/pages/layouts de Next.js.
- `src/common/` solo contiene código compartido cross-cutting.
- No cambiar comportamiento funcional; solo mover y renombrar.
- `npm run lint` y `npm run build` deben pasar al finalizar.

---

### Task 1: Reorganizar estructura base

**Files:**
- Create: `src/app/`
- Create: `src/features/`
- Create: `src/common/`
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: existing `app/`, `components/ui/`, `lib/` directories.
- Produces: `src/app/`, `src/features/`, `src/common/`, updated path aliases.

- [ ] **Step 1: Mover `app/` a `src/app/`**

```bash
git mv app src/app
```

- [ ] **Step 2: Mover `components/ui/` a `src/common/components/ui/`**

```bash
mkdir -p src/common/components
git mv components/ui src/common/components/ui
```

- [ ] **Step 3: Crear `src/common/lib/` y mover `lib/utils.ts`**

```bash
mkdir -p src/common/lib
git mv lib/utils.ts src/common/lib/utils.ts
```

- [ ] **Step 4: Actualizar `tsconfig.json` paths**

Reemplazar:

```json
"paths": {
  "@/*": ["./*"],
  "@app/*": ["./app/*"]
}
```

Por:

```json
"paths": {
  "@/*": ["./src/*"],
  "@app/*": ["./src/app/*"],
  "@features/*": ["./src/features/*"],
  "@common/*": ["./src/common/*"]
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: move app, components and lib into src/"
```

---

### Task 2: Crear slice `platform-auth`

**Files:**
- Create: `src/features/platform-auth/schemas/platform-login.schema.ts`
- Create: `src/features/platform-auth/actions/platform-login.action.ts`
- Create: `src/features/platform-auth/components/platform-login-form.tsx`
- Create: `src/features/platform-auth/types/platform-account.types.ts`
- Create: `src/features/platform-auth/types/platform-login-result.types.ts`
- Create: `src/features/platform-auth/types/platform-login-input.types.ts`
- Create: `src/features/platform-auth/types/platform-login-action-state.types.ts`
- Create: `src/features/platform-auth/types/backend-error.types.ts`
- Create: `src/features/platform-auth/services/platform-auth.service.ts`
- Create: `src/features/platform-auth/utils/platform-auth-cookies.util.ts`
- Modify: `src/app/auth/platform/login/page.tsx`
- Delete: `src/app/auth/platform/login/schema.ts`
- Delete: `src/app/auth/platform/login/actions.ts`
- Delete: `src/app/auth/platform/login/platform-login-form.tsx`
- Delete: `lib/platform-auth.ts`
- Delete: `lib/auth-cookies.ts`

**Interfaces:**
- Consumes: `lib/platform-auth.ts`, `lib/auth-cookies.ts`, `src/app/auth/platform/login/schema.ts`, `src/app/auth/platform/login/actions.ts`, `src/app/auth/platform/login/platform-login-form.tsx`.
- Produces: types `PlatformAccount`, `PlatformLoginResult`, `PlatformLoginInput`, `PlatformLoginActionState`, `BackendError`; functions `loginPlatformAccount`, `getPlatformAccount`, `setPlatformAuthCookies`; schema `platformLoginSchema`; action `loginPlatform`; component `PlatformLoginForm`.

- [ ] **Step 1: Crear tipos individuales**

`src/features/platform-auth/types/platform-account.types.ts`:

```ts
export type PlatformAccount = {
  platformAccountId: string;
  email: string;
  name: string;
  lastName: string;
};
```

`src/features/platform-auth/types/platform-login-result.types.ts`:

```ts
import type { PlatformAccount } from "./platform-account.types";

export type PlatformLoginResult = {
  account: PlatformAccount;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};
```

`src/features/platform-auth/types/platform-login-input.types.ts`:

```ts
export type PlatformLoginInput = {
  email: string;
  password: string;
};
```

`src/features/platform-auth/types/platform-login-action-state.types.ts`:

```ts
export type PlatformLoginActionState = {
  error?: string;
  errors?: string[];
  fields?: Array<"email" | "password">;
};
```

`src/features/platform-auth/types/backend-error.types.ts`:

```ts
export type BackendError = {
  status: number;
  message: string;
};
```

- [ ] **Step 2: Crear cookies de plataforma**

`src/features/platform-auth/utils/platform-auth-cookies.util.ts`:

```ts
import { cookies } from "next/headers";

import type { PlatformLoginResult } from "../types/platform-login-result.types";

export const PLATFORM_ACCESS_TOKEN_COOKIE = "platform_access_token";
export const PLATFORM_REFRESH_TOKEN_COOKIE = "platform_refresh_token";

export async function setPlatformAuthCookies(
  tokens: PlatformLoginResult["tokens"],
) {
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
```

- [ ] **Step 3: Crear servicios de plataforma**

`src/features/platform-auth/services/platform-auth.service.ts`:

```ts
import type { BackendError } from "../types/backend-error.types";
import type { PlatformLoginInput } from "../types/platform-login-input.types";
import type { PlatformLoginResult } from "../types/platform-login-result.types";
import type { PlatformAccount } from "../types/platform-account.types";
import { PLATFORM_ACCESS_TOKEN_COOKIE } from "../utils/platform-auth-cookies.util";
import { cookies } from "next/headers";

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

export async function loginPlatformAccount(
  input: PlatformLoginInput,
): Promise<PlatformLoginResult> {
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

- [ ] **Step 4: Mover schema de login**

`src/features/platform-auth/schemas/platform-login.schema.ts`:

```ts
import { z } from "zod";

import type { PlatformLoginActionState } from "../types/platform-login-action-state.types";

export const platformLoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo es requerido.", abort: true })
    .check(z.email({ message: "Ingresá un correo válido." })),
  password: z.string().min(1, "La contraseña es requerida."),
});

export type { PlatformLoginActionState };
```

- [ ] **Step 5: Mover action de login**

`src/features/platform-auth/actions/platform-login.action.ts`:

```ts
"use server";

import { redirect } from "next/navigation";

import { platformLoginSchema } from "../schemas/platform-login.schema";
import type { PlatformLoginActionState } from "../types/platform-login-action-state.types";
import { loginPlatformAccount } from "../services/platform-auth.service";
import { setPlatformAuthCookies } from "../utils/platform-auth-cookies.util";

export async function loginPlatform(
  _previousState: PlatformLoginActionState,
  formData: FormData,
): Promise<PlatformLoginActionState> {
  const parsed = platformLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    const fields = parsed.error.issues
      .map((issue) => issue.path[0])
      .filter(
        (field): field is "email" | "password" =>
          field === "email" || field === "password",
      );

    return {
      error: errors[0] ?? "Revisá los datos ingresados.",
      errors,
      fields,
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

- [ ] **Step 6: Mover formulario de login**

`src/features/platform-auth/components/platform-login-form.tsx`:

```tsx
"use client";

import type { FormEvent } from "react";
import { useActionState, useTransition } from "react";

import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { PasswordInput } from "@common/components/ui/password-input";
import { loginPlatform } from "../actions/platform-login.action";
import type { PlatformLoginActionState } from "../types/platform-login-action-state.types";

const initialState: PlatformLoginActionState = {};

export function PlatformLoginForm() {
  const [state, formAction] = useActionState(loginPlatform, initialState);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
        <p className="text-muted-foreground text-sm">
          <span className="hidden md:block">Ingresá tus credenciales para acceder a tu cuenta.</span>
          <span className="md:hidden">Ingresá tus credenciales para continuar.</span>
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {state.error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>Ups... algo salió mal</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {(state.errors ?? [state.error]).map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              aria-invalid={state.fields?.includes("email")}
              autoComplete="email"
              id="email"
              name="email"
              placeholder="correo@ejemplo.com"
            />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <PasswordInput
              aria-invalid={state.fields?.includes("password")}
              autoComplete="current-password"
              id="password"
              name="password"
            />
          </Field>
        </FieldGroup>

        <footer className="mt-6 flex w-full flex-col gap-4">
          <Button variant="default" type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </footer>
      </div>
    </form>
  );
}
```

- [ ] **Step 7: Actualizar la página de login de plataforma**

`src/app/auth/platform/login/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Card, CardContent } from "@common/components/ui/card";
import { getPlatformAccount } from "@features/platform-auth/services/platform-auth.service";
import { PlatformLoginForm } from "@features/platform-auth/components/platform-login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en tu cuenta",
};

export default async function LoginPage() {
  const account = await getPlatformAccount();

  if (account) {
    redirect("/platform/dashboard");
  }

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

- [ ] **Step 8: Eliminar archivos viejos**

```bash
git rm src/app/auth/platform/login/schema.ts
git rm src/app/auth/platform/login/actions.ts
git rm src/app/auth/platform/login/platform-login-form.tsx
git rm lib/platform-auth.ts
git rm lib/auth-cookies.ts
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "refactor: extract platform-auth vertical slice"
```

---

### Task 3: Actualizar imports de componentes UI en todo el proyecto

**Files:**
- Modify: todos los archivos que importen desde `@/components/ui/*` o `components/ui/*`.

**Interfaces:**
- Consumes: existing component imports.
- Produces: imports updated to `@common/components/ui/*`.

- [ ] **Step 1: Buscar todos los imports a `@/components/ui/` y reemplazarlos por `@common/components/ui/`**

Archivos a revisar (después del movimiento):

- `src/app/auth/platform/login/page.tsx`
- `src/features/platform-auth/components/platform-login-form.tsx`
- `src/common/components/ui/command.tsx`
- `src/common/components/ui/dialog.tsx`
- `src/common/components/ui/input-group.tsx`
- `src/common/components/ui/popover.tsx`
- `src/common/components/ui/tabs.tsx`
- `src/common/components/ui/textarea.tsx`
- Cualquier otro archivo en `src/` que importe componentes UI.

Ejemplo de reemplazo:

```ts
import { Button } from "@/components/ui/button";
```

→

```ts
import { Button } from "@common/components/ui/button";
```

- [ ] **Step 2: Buscar imports a `@/lib/utils` y reemplazarlos por `@common/lib/utils`**

Archivos a revisar:

- Todos los archivos en `src/common/components/ui/*` que usen `cn` desde `@/lib/utils`.

Ejemplo:

```ts
import { cn } from "@/lib/utils";
```

→

```ts
import { cn } from "@common/lib/utils";
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: update shared imports to @common aliases"
```

---

### Task 4: Crear estructura base de `institutional-auth`

**Files:**
- Create: `src/features/institutional-auth/components/institutional-login-form.tsx`
- Create: `src/features/institutional-auth/components/institutional-register-form.tsx`
- Create: `src/features/institutional-auth/schemas/institutional-login.schema.ts`
- Create: `src/features/institutional-auth/schemas/institutional-register.schema.ts`
- Create: `src/features/institutional-auth/actions/institutional-login.action.ts`
- Create: `src/features/institutional-auth/actions/institutional-register.action.ts`
- Create: `src/features/institutional-auth/types/institutional-login-input.types.ts`
- Create: `src/features/institutional-auth/types/institutional-login-action-state.types.ts`
- Create: `src/features/institutional-auth/types/institutional-register-input.types.ts`
- Create: `src/features/institutional-auth/types/institutional-register-action-state.types.ts`
- Create: `src/features/institutional-auth/services/institutional-auth.service.ts`

**Interfaces:**
- Consumes: existing placeholder pages `src/app/auth/(institutional)/login/page.tsx` and `src/app/auth/(institutional)/register/page.tsx`.
- Produces: scaffolded slice with minimal types, schemas, actions, services and components.

- [ ] **Step 1: Crear tipos base**

`src/features/institutional-auth/types/institutional-login-input.types.ts`:

```ts
export type InstitutionalLoginInput = {
  email: string;
  password: string;
};
```

`src/features/institutional-auth/types/institutional-login-action-state.types.ts`:

```ts
export type InstitutionalLoginActionState = {
  error?: string;
  errors?: string[];
  fields?: Array<"email" | "password">;
};
```

`src/features/institutional-auth/types/institutional-register-input.types.ts`:

```ts
export type InstitutionalRegisterInput = {
  email: string;
  password: string;
};
```

`src/features/institutional-auth/types/institutional-register-action-state.types.ts`:

```ts
export type InstitutionalRegisterActionState = {
  error?: string;
  errors?: string[];
  fields?: Array<"email" | "password">;
};
```

- [ ] **Step 2: Crear schemas base**

`src/features/institutional-auth/schemas/institutional-login.schema.ts`:

```ts
import { z } from "zod";

export const institutionalLoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo es requerido.", abort: true })
    .check(z.email({ message: "Ingresá un correo válido." })),
  password: z.string().min(1, "La contraseña es requerida."),
});
```

`src/features/institutional-auth/schemas/institutional-register.schema.ts`:

```ts
import { z } from "zod";

export const institutionalRegisterSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo es requerido.", abort: true })
    .check(z.email({ message: "Ingresá un correo válido." })),
  password: z.string().min(1, "La contraseña es requerida."),
});
```

- [ ] **Step 3: Crear actions base**

`src/features/institutional-auth/actions/institutional-login.action.ts`:

```ts
"use server";

import { institutionalLoginSchema } from "../schemas/institutional-login.schema";
import type { InstitutionalLoginActionState } from "../types/institutional-login-action-state.types";

export async function loginInstitutional(
  _previousState: InstitutionalLoginActionState,
  formData: FormData,
): Promise<InstitutionalLoginActionState> {
  const parsed = institutionalLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    const fields = parsed.error.issues
      .map((issue) => issue.path[0])
      .filter(
        (field): field is "email" | "password" =>
          field === "email" || field === "password",
      );

    return {
      error: errors[0] ?? "Revisá los datos ingresados.",
      errors,
      fields,
    };
  }

  return {};
}
```

`src/features/institutional-auth/actions/institutional-register.action.ts`:

```ts
"use server";

import { institutionalRegisterSchema } from "../schemas/institutional-register.schema";
import type { InstitutionalRegisterActionState } from "../types/institutional-register-action-state.types";

export async function registerInstitutional(
  _previousState: InstitutionalRegisterActionState,
  formData: FormData,
): Promise<InstitutionalRegisterActionState> {
  const parsed = institutionalRegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    const fields = parsed.error.issues
      .map((issue) => issue.path[0])
      .filter(
        (field): field is "email" | "password" =>
          field === "email" || field === "password",
      );

    return {
      error: errors[0] ?? "Revisá los datos ingresados.",
      errors,
      fields,
    };
  }

  return {};
}
```

- [ ] **Step 4: Crear servicios base**

`src/features/institutional-auth/services/institutional-auth.service.ts`:

```ts
export async function loginInstitutionalAccount(_input: {
  email: string;
  password: string;
}): Promise<void> {
  // TODO: implement institutional login integration
}

export async function registerInstitutionalAccount(_input: {
  email: string;
  password: string;
}): Promise<void> {
  // TODO: implement institutional register integration
}
```

- [ ] **Step 5: Crear componentes placeholder**

`src/features/institutional-auth/components/institutional-login-form.tsx`:

```tsx
export function InstitutionalLoginForm() {
  return <div>Institutional Login Form</div>;
}
```

`src/features/institutional-auth/components/institutional-register-form.tsx`:

```tsx
export function InstitutionalRegisterForm() {
  return <div>Institutional Register Form</div>;
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: scaffold institutional-auth vertical slice"
```

---

### Task 5: Verificación final

**Files:**
- Modify: ninguno (solo verificación).

**Interfaces:**
- Consumes: todo el código movido y refactorizado.
- Produces: resultados de `npm run lint` y `npm run build`.

- [ ] **Step 1: Ejecutar lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 2: Ejecutar build**

```bash
npm run build
```

Expected: compiled successfully.

- [ ] **Step 3: Revisar que no queden imports rotos ni archivos huérfanos**

```bash
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "@/components/ui\|@/lib/utils\|lib/platform-auth\|lib/auth-cookies" {} \;
```

Expected: no results.

- [ ] **Step 4: Commit final si hay cambios pendientes**

```bash
git add .
git commit -m "chore: verify vertical slicing refactor"
```

---

## Self-Review

1. **Spec coverage:**
   - `src/app/` exclusivo para routing → Task 1.
   - `src/common/` para UI/utilidades → Task 1 y Task 3.
   - `src/features/platform-auth/` con tipos individuales → Task 2.
   - `src/features/institutional-auth/` scaffold → Task 4.
   - Verificación lint/build → Task 5.

2. **Placeholder scan:** no TBD/TODO en código productivo (solo en servicios base de institutional-auth, explícitamente marcados como TODO de integración futura).

3. **Type consistency:** nombres de types y funciones coinciden entre archivos y tasks.
