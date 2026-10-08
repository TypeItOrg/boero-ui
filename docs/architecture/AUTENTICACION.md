# Autenticación y Manejo de Sesiones

Esta guía explica cómo el frontend gestiona las sesiones, los tokens y la seguridad a través de la capa proxy de Next.js.

---

## 1. Dos Contextos de Sesión Independientes

La aplicación maneja dos tipos de usuarios totalmente separados, cada uno con sus propias cookies, endpoints de autenticación y políticas de redirección:

| Contexto | Destinado a | Rutas de la UI | Rutas de API Proxy |
| :--- | :--- | :--- | :--- |
| **Institucional** | Docentes, estudiantes y personal administrativo de una institución específica. | `/(institutional)/*` | `/api/institutional/*` |
| **Administrador de Plataforma** | Administradores globales del sistema Boero. | `/admin/*` | `/api/admin/*` |

---

## 2. Almacenamiento Seguro de Tokens (Cookies HttpOnly)

Por seguridad (prevención de ataques XSS), los tokens **nunca se guardan en `localStorage` ni en memoria de JavaScript en el cliente**:

- Se almacenan exclusivamente en **cookies `HttpOnly`** con flags `SameSite` y `Secure` (en producción).
- Existen cookies separadas para:
  - `access_token` (vida corta).
  - `refresh_token` (vida más larga, utilizado para rotación).
- La UI en el navegador no necesita leer directamente estos tokens; viajan automáticamente con cada petición al proxy de Next.js (`/api/*`) y a las Server Actions.

---

## 3. Capa Proxy y Refresco de Tokens (`src/proxy.ts`)

Todas las peticiones entrantes pasan por el proxy de Next.js antes de ser procesadas:

```
[ Navegador ] ──(con cookies HttpOnly)──> [ Proxy Next.js ] ──(Bearer Token)──> [ Backend Spring Boot ]
```

### Ciclo de vida de una petición protegida

1. **Token vigente**: Si el `access_token` está presente en la cookie, la petición continúa hacia la página o Route Handler.
2. **Token ausente o expirado**:
   - El proxy intenta renovar la sesión automáticamente llamando al endpoint de refresco del backend con el `refresh_token`.
   - **Si el refresco es exitoso**:
     - El backend devuelve un nuevo par de tokens (rotación).
     - El proxy actualiza las cookies en la respuesta al navegador y continúa la ejecución de la petición original sin interrumpir al usuario.
   - **Si el refresco falla con error 401 (token inválido/expirado)**:
     - El proxy **elimina las cookies de autenticación**.
     - En vistas: redirige automáticamente al formulario de inicio de sesión (`/auth/login`).
     - En rutas `/api/*`: responde con código `401 Unauthorized`.

---

## 4. Invariantes Críticos de Seguridad y Red

### A. Deduplicación de peticiones de refresco en vuelo
Cuando una página carga múltiples componentes o recursos en paralelo con un access token vencido, se disparan varias peticiones simultáneas.

- Para evitar enviar múltiples peticiones de refresco al backend con el mismo token rotativo (lo cual invalidaría la sesión por detección de reuso), el frontend implementa **deduplicación en vuelo (`inFlightRefreshes`)**.
- Todas las peticiones concurrentes comparten **una única llamada HTTP de refresco** al backend.

### B. Preservación de cookies ante errores transitorios
- Las cookies de sesión **solo se eliminan si el backend responde con un 401 definitivo**.
- Si el backend tiene una caída temporal, timeout o error 5xx, las cookies **no se borran**. Esto evita que los usuarios pierdan su sesión por un simple microcorte de red. En peticiones de API se responde con un código `503 Service Unavailable`.

### C. Rutas sólo para invitados (`Guest-Only`)
- Las pantallas de login (`/auth/login`) son exclusivas para usuarios sin sesión activa.
- Si un usuario autenticado intenta entrar al login, el proxy valida su sesión y lo redirige automáticamente a su panel principal.
