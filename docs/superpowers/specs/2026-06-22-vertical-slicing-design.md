# Vertical Slicing Architecture Design

## Goal

Reorganizar el codebase de `boero-ui` para adoptar una arquitectura de **vertical slicing**, donde cada feature contenga sus propios componentes, schemas, actions, types y utils. Además, separar el código compartido en `src/common/` y dejar `src/app/` exclusivamente como capa de routing/pages de Next.js.

## Context

El proyecto actual mezcla responsabilidades en pocos archivos:

- `app/auth/platform/login/` agrupa page, form, actions y schema.
- `lib/platform-auth.ts` contiene tipos, fetch de login, manejo de cookies y obtención de cuenta.
- `lib/auth-cookies.ts` tiene constantes de cookies de plataforma.
- `components/ui/` aloja componentes compartidos sin un namespace claro.

Esto dificulta escalar, testear y encontrar código. El objetivo es que cada feature sea autónoma y cada archivo tenga una única responsabilidad clara.

## Architecture

### Directory structure

```
src/
  app/                          # Next.js routing layer only
    auth/
      (institutional)/
        layout.tsx
        login/page.tsx
        register/page.tsx
      platform/
        layout.tsx
        login/page.tsx
    platform/
      dashboard/page.tsx
    layout.tsx
    page.tsx

  features/                     # Vertical slices
    institutional-auth/
      components/
        institutional-login-form.tsx
        institutional-register-form.tsx
      schemas/
        institutional-login.schema.ts
        institutional-register.schema.ts
      actions/
        institutional-login.action.ts
        institutional-register.action.ts
      types/
        institutional-login-input.types.ts
        institutional-login-action-state.types.ts
        institutional-register-input.types.ts
        institutional-register-action-state.types.ts

    platform-auth/
      components/
        platform-login-form.tsx
      schemas/
        platform-login.schema.ts
      actions/
        platform-login.action.ts
      types/
        platform-account.types.ts
        platform-login-result.types.ts
        platform-login-input.types.ts
        platform-login-action-state.types.ts
        backend-error.types.ts
      services/
        login-platform-account.service.ts
        get-platform-account.service.ts
      utils/
        platform-auth-cookies.util.ts

  common/                       # Cross-cutting/shared code
    components/
      ui/
        alert.tsx
        button.tsx
        card.tsx
        ...
    lib/
      utils.ts
      get-backend-message.util.ts
```

### Naming conventions

- **One interface/type per file**: cada `type`/`interface` vive en su propio archivo.
- **Suffix by layer** (dot-separated):
  - Schemas: `<name>.schema.ts`
  - Actions: `<name>.action.ts`
  - Types: `<name>.types.ts`
  - Services: `<name>.service.ts`
  - Utils: `<name>.util.ts`
  - Components: `<name>-form.tsx`, `<name>-button.tsx`
- **Services para interacciones con backend**: funciones que hacen fetch a APIs externas van en `services/`.
- **Utils para helpers locales**: funciones puras o de infraestructura local (cookies, parseo, etc.) van en `utils/`.

### Path aliases

Actualizar `tsconfig.json` para reflejar la nueva estructura:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@app/*": ["./src/app/*"],
      "@features/*": ["./src/features/*"],
      "@common/*": ["./src/common/*"]
    }
  }
}
```

### Feature boundaries

- `platform-auth`: login de plataforma, manejo de tokens/cookies, obtención de cuenta.
- `institutional-auth`: login y registro institucional (preparado para crecer; ahora tiene páginas placeholder).
- `dashboard`: por ahora solo contiene la página. Si crece, se convierte en slice con sus propios componentes/services.

### Shared/common boundaries

- Componentes UI genéricos (Button, Input, Card, etc.) van a `common/components/ui/`.
- Utilidades puras (`cn`, helpers) van a `common/lib/`.
- Cualquier código que no pertenezca a una feature específica vive en `common/`.

## Decisions

1. **No usar `(routing)`**: se descartó el route group porque `src/app/` ya cumple la función de capa de routing.
2. **`src/features/` fuera de `app/`**: mantiene clara la separación entre routing y dominio.
3. **`src/common/` para código compartido**: centraliza UI genérica y utilidades.
4. **Una interfaz por archivo**: maximiza la claridad y el descubrimiento; acepta que algunos archivos de types tengan un único export.
5. **Sufijo por capa con punto**: nombres explícitos que indican la responsabilidad del archivo (`*.schema.ts`, `*.action.ts`, `*.service.ts`, `*.util.ts`, `*.types.ts`).
6. **Sin carpeta `cookies`**: el manejo de cookies vive en `utils/` como una utilidad más.
7. **`services/` para interacciones con backend**: funciones que hacen fetch al backend se agrupan en `services/`, incluso si al principio son pocas.
8. **Utilidades compartidas en `common/lib/`**: funciones genéricas como `getBackendMessage` viven en `common/lib/`.

## Migration scope

Archivos a mover/renombrar:

- `app/` → `src/app/`
- `components/ui/` → `src/common/components/ui/`
- `lib/utils.ts` → `src/common/lib/utils.ts`
- `lib/auth-cookies.ts` → `src/features/platform-auth/utils/platform-auth-cookies.util.ts`
- `lib/platform-auth.ts`:
  - types → `src/features/platform-auth/types/`
  - `loginPlatformAccount` → `src/features/platform-auth/services/login-platform-account.service.ts`
  - `getPlatformAccount` → `src/features/platform-auth/services/get-platform-account.service.ts`
  - `setPlatformAuthCookies` → `src/features/platform-auth/utils/platform-auth-cookies.util.ts`
  - `getBackendMessage` → `src/common/lib/get-backend-message.util.ts`
- `app/auth/platform/login/schema.ts` → `src/features/platform-auth/schemas/platform-login.schema.ts`
- `app/auth/platform/login/actions.ts` → `src/features/platform-auth/actions/platform-login.action.ts`
- `app/auth/platform/login/platform-login-form.tsx` → `src/features/platform-auth/components/platform-login-form.tsx`
- `app/auth/platform/login/page.tsx` → `src/app/auth/platform/login/page.tsx` (actualizar imports)

## Testing/verification

- `npm run lint` debe pasar sin errores.
- `npm run build` debe compilar exitosamente.
- No deben quedar imports rotos.
- No deben quedar referencias a `lib/platform-auth.ts`, `lib/auth-cookies.ts` ni `components/ui/` desde fuera de `src/common/`.

## Out of scope

- Cambiar comportamiento funcional.
- Agregar tests (el proyecto no tiene suite de tests configurada).
- Refactorizar lógica interna de los servicios; solo se mueven.
- Renombrar funciones/types más allá de lo necesario para la estructura.
