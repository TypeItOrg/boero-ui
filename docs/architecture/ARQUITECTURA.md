# Arquitectura del Frontend

Esta guía describe el stack tecnológico, la organización del código fuente y las convenciones esenciales de arquitectura en el frontend de Boero UI.

---

## 1. Stack Tecnológico

El proyecto está construido sobre un stack moderno orientado a rendimiento, tipado estricto y componentes de servidor:

- **Framework**: [Next.js](https://nextjs.org/) (versión 16+ con **App Router**, React Server Components y Server Actions).
- **Librería de UI**: [React](https://react.dev/) (versión 19+).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (versión 6+ con modo estricto).
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) (versión 4+) con variables CSS dinámicas para soporte de temas.
- **Componentes Base**: [shadcn/ui](https://ui.shadcn.com/) construidos sobre primitivas accesibles de [Radix UI](https://www.radix-ui.com/) y [React Aria](https://react-spectrum.adobe.com/react-aria/).
- **Estado Asíncrono / Caché Cliente**: [TanStack Query](https://tanstack.com/query/latest) (v5).
- **Validación de Formularios**: [React Hook Form](https://react-hook-form.com/) y [Zod](https://zod.dev/).
- **Testing**: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/) y [Mock Service Worker (MSW)](https://mswjs.io/).

---

## 2. Organización del Código (`src/`)

El código fuente se estructura en tres capas principales:

```
src/
├── app/          # Enrutamiento, layouts, páginas y API Route Handlers (Next.js App Router)
├── features/     # Módulos organizados por dominio funcional
├── common/       # Componentes base, utilidades y servicios compartidos
├── proxy.ts      # Enrutamiento y control de acceso del proxy
└── proxy.test.ts # Pruebas del proxy de autenticación
```

---

### A. Capa de Rutas: `src/app/`

Utiliza el sistema de carpetas de Next.js App Router:

- **`app/(institutional)/`**: Vistas correspondientes al contexto institucional (gestión académica, inscripciones, planes de estudio, etc.).
- **`app/admin/`**: Vistas correspondientes a la administración de la plataforma (cuentas globales, instituciones, etc.).
- **`app/auth/`**: Pantallas de inicio de sesión y recuperación de credenciales.
- **`app/api/`**: Route Handlers que actúan como proxy o exponen endpoints hacia el cliente:
  - `/api/institutional/*`: Endpoints protegidos por sesión institucional.
  - `/api/admin/*`: Endpoints protegidos por sesión de plataforma.
  - `/api/public/*`: Endpoints de acceso público.
- **`layout.tsx` / `providers.tsx`**: Layout raíz y configuración de proveedores de contexto (QueryClient, ThemeProvider, Toaster, etc.).
- **`error.tsx` / `global-error.tsx` / `not-found.tsx`**: Manejadores estándar de errores y pantallas 404.

---

### B. Capa por Dominio: `src/features/`

Toda la lógica de negocio, vistas y componentes se agrupa por módulo funcional (Feature-Sliced):

Ejemplos: `academic`, `people`, `institutions`, `platform-accounts`, `roles`, etc.

#### Anatomía estándar de una feature

Cada módulo en `src/features/<nombre-feature>/` mantiene una estructura predecible:

| Directorio | Propósito |
| :--- | :--- |
| `actions/` | **Server Actions** para mutaciones iniciadas por la UI (crear, editar, eliminar, cambiar estado). |
| `components/` | Componentes React del dominio (tablas, formularios, diálogos, tarjetas). |
| `schemas/` | Esquemas de validación [Zod](https://zod.dev/) para formularios y entradas de acciones. |
| `services/` | Funciones de llamada al backend mediante el transporte autenticado. |
| `types/` | Definiciones de tipos TypeScript exclusivas del módulo. |
| `constants/` | Constantes, valores fijos o enumeraciones auxiliares del módulo. |
| `utils/` | Funciones utilitarias y transformadores de datos específicos. |

---

### C. Capa Compartida: `src/common/`

Contiene piezas reutilizables en múltiples features:

- **`components/ui/`**: Componentes visuales primitivos de shadcn/ui (`button`, `dialog`, `input`, `table`, etc.).
- **`components/`**: Componentes transversales compuestos (ej. `action-form`, breadcrumbs, barras de navegación).
- **`hooks/`**: Custom hooks compartidos.
- **`services/`**: Transporte HTTP autenticado y servicio del proxy de autenticación.
- **`utils/`**: Funciones de utilidad general (formateo de fechas, cadenas, clases CSS).
- **`types/`**: Tipos globales transversales (paginación, respuestas estándar).

---

## 3. Convenciones Estrictas de Tipado TypeScript

Para mantener el código mantenible y evitar dependencias circulares o sobrecarga en el compilador, se siguen estas reglas:

### 1. Definición manual de tipos
- Los tipos del frontend se escriben **manualmente** a partir de las respuestas y necesidades de la UI.
- No se auto-generan ni sincronizan directamente tipos crudos desde OpenAPI.

### 2. Regla "Un tipo por archivo"
- Cada archivo `*.types.ts` debe contener **exactamente una única declaración** de nivel superior (`type`, `interface` o `enum`).
- **Ejemplo**:
  - `student.types.ts` contiene solo `export type Student = { ... }`.
  - `student-status.types.ts` contiene solo `export enum StudentStatus { ... }`.

### 3. Prohibidos los archivos barril (`index.ts`) para tipos
- Cada tipo debe importarse directamente desde su archivo específico.
- **Correcto**:
  ```ts
  import type { Course } from "@features/academic/types/course.types";
  import type { CourseStatus } from "@features/academic/types/course-status.types";
  ```
- **Incorrecto**:
  ```ts
  // NO permitido:
  import { Course, CourseStatus } from "@features/academic/types";
  ```

---

## 4. Convenciones de Código y Legibilidad

1. **Uso de llaves obligatorio**: Toda estructura de control de flujo (`if`, `for`, `while`) debe llevar llaves `{ ... }`, incluso para guards o salidas tempranas de una sola línea.
2. **Separación de responsabilidades en funciones**:
   - Bloque de validación inicial.
   - Bloque de preparación de datos.
   - Bloque de llamada de red / ejecución asíncrona.
   - Bloque de retorno o redirección.
   - Separar cada bloque con una línea en blanco para máxima legibilidad.
