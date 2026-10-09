# Entorno de Desarrollo

Esta guía detalla los requisitos, pasos y buenas prácticas para levantar y trabajar en el frontend de Boero UI en tu entorno local.

---

## 1. Requisitos Previos

Podés ejecutar el proyecto de dos formas: mediante **Docker** (recomendado para aislar dependencias) o de forma **Nativa** en tu sistema operativo.

### Requisitos generales
- **Git**
- **Docker y Docker Compose** (versión 2.22 o superior con soporte para `compose watch`, si usás Docker).
- **GNU Make** (opcional, para atajos de comandos).

### Requisitos adicionales (si ejecutás de forma nativa sin Docker)
- **Node.js**: versión 24 LTS / Alpine (`>=24.0.0`).
- **pnpm**: versión 12 o superior (`pnpm@12.x`).

---

## 2. Variables de Entorno

El proyecto requiere dos variables principales para comunicarse tanto desde el navegador del usuario como desde el servidor de Next.js hacia el backend.

Copiá el archivo de plantilla:

```bash
# Para ejecución con Docker (Make / Compose):
cp .env.example .env.dev

# Para ejecución nativa (pnpm):
cp .env.example .env.local
```

### Significado de cada variable

| Variable | Descripción | Valor típico local |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL pública accesible desde el **navegador del cliente**. Se utiliza para peticiones del lado cliente hacia la capa proxy `/api/*` de Next.js. | `http://localhost:3000` |
| `BOERO_API_URL` | URL de la API del **backend (Spring Boot)** a la que se conecta el servidor Next.js internamente (Server Components, Server Actions y Proxy). | Ver tabla abajo |

#### Configuración de `BOERO_API_URL` según tu entorno:

- **Ejecución Nativa (`pnpm dev` en Linux / Mac / Windows)**:
  ```env
  BOERO_API_URL=http://localhost:8080
  ```
- **Ejecución con Docker en Linux** (requiere la IP del gateway del host):
  ```env
  BOERO_API_URL=http://172.17.0.1:8080
  ```
- **Ejecución con Docker en macOS / Windows**:
  ```env
  BOERO_API_URL=http://host.docker.internal:8080
  ```

---

## 3. Cómo Levantar el Proyecto

Elegí uno de los dos métodos según tu preferencia:

### Opción A: Con Docker Compose (Recomendado)

Utiliza `compose.yaml` con la funcionalidad de **Docker Compose Watch**, que sincroniza el código en caliente entre tu máquina y el contenedor sin reconstruir la imagen.

1. Asegurate de tener configurado `.env.dev`.
2. Ejecutá:
   ```bash
   make
   # o directamente: docker compose up --watch
   ```
3. La aplicación estará disponible en: **http://localhost:3000**

> [!NOTE]
> `compose watch` detecta cambios en `./src`, `./public` y archivos de configuración y los sincroniza al instante. Si modificás dependencias (`package.json` o `pnpm-lock.yaml`), reconstruye el contenedor de forma automática.

Para ver los logs o detener la ejecución:
```bash
make logs   # Ver logs en tiempo real
make down   # Detener los contenedores
```

---

### Opción B: Ejecución Nativa (con pnpm)

Si preferís correr Next.js directamente sobre tu sistema operativo:

1. Asegurate de tener configurado `.env.local` con `BOERO_API_URL=http://localhost:8080`.
2. Instalá las dependencias del proyecto:
   ```bash
   pnpm install
   ```
3. Iniciá el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
4. Abrí **http://localhost:3000** en tu navegador.

---

## 4. Comandos de Calidad y Desarrollo Diario

El proyecto cuenta con scripts para garantizar la calidad del código, tipos y pruebas:

| Acción | Con pnpm (Nativo) | Con Make (Docker) | Descripción |
| :--- | :--- | :--- | :--- |
| **Iniciar servidor dev** | `pnpm dev` | `make` o `make dev` | Inicia Next.js con recarga rápida. |
| **Ejecutar tests** | `pnpm test` | `make test` | Corre la suite de pruebas unitarias con Jest. |
| **Tests interactivos** | `pnpm test:watch` | - | Re-ejecuta pruebas al guardar cambios. |
| **Cobertura de tests** | `pnpm test:coverage` | - | Genera reporte de cobertura de código. |
| **Verificación de tipos** | `pnpm typecheck` | `make typecheck` | Chequea TypeScript (`tsc --noEmit`). |
| **Linter** | `pnpm lint` | `make lint` | Ejecuta ESLint sobre el código. |
| **Formatear código** | `pnpm format` | `make format` | Formatea con Prettier. |
| **Chequear formato** | `pnpm format:check` | `make format-check` | Verifica que el código cumpla con Prettier. |
| **Detener contenedores** | - | `make down` | Apaga los contenedores Docker. |
| **Limpieza** | `rm -rf .next` | `make clean` | Detiene contenedores y limpia procesos huérfanos. |

---

## 5. Control de Calidad Pre-Commit (Husky)

El repositorio tiene configurado **Husky** y **lint-staged**. Antes de confirmar cualquier commit (`git commit`), se ejecutarán automáticamente:
- `eslint --fix` sobre los archivos JS/TS modificados.
- `prettier --write` sobre archivos de código, estilos y documentación.

Si existe algún error de linting que no pueda corregirse de forma automática, el commit será rechazado hasta que se solucione.

---

## 6. Solución de Problemas Frecuentes

### 1. El frontend no responde o da errores 500 al llamar a `/api/*`
- **Causa**: El servidor de Next.js no puede alcanzar la URL del backend configurada en `BOERO_API_URL`.
- **Solución**:
  - Verificá que el backend esté levantado y respondiendo en el puerto correspondiente (ej. 8080).
  - Si estás en Linux corriendo con Docker, recordá usar la IP del bridge `http://172.17.0.1:8080` y no `localhost:8080`.

### 2. Puerto 3000 ocupado
- **Causa**: Hay otra instancia de Next.js o un proceso escuchando en el puerto 3000.
- **Solución**: Podés identificar el proceso con `lsof -i :3000` y detenerlo con `kill -9 <PID>`, o en modo nativo pasar un puerto distinto: `pnpm dev -p 3001`.

### 3. Cambios en dependencias no se reflejan en Docker
- **Solución**: Detené el contenedor y reconstruilo desde cero:
  ```bash
  docker compose build --no-cache
  make
  ```

### 4. Errores extraños de caché en Next.js
- **Solución**: Borrá el directorio `.next` (en nativo) o eliminá el volumen de Docker:
  ```bash
  docker compose down -v
  ```

---

## 7. Parches de Seguridad de Dependencias

Los overrides y parches de pnpm se mantienen en `pnpm-workspace.yaml`, junto con sus resoluciones en `pnpm-lock.yaml`. El Dockerfile copia `patches/` antes de instalar para aplicar las mismas correcciones en CI y contenedores.

`braces@3.0.3` no tiene una versión oficial corregida para [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). El parche `patches/braces@3.0.3.patch` limita el anidamiento a 128 niveles durante el parseo y los recorridos de AST. Las entradas excesivas generan un `SyntaxError` controlado antes de agotar la pila. Sus tests reproducen el problema con una pila limitada y verifican alternancias, rangos y serialización de patrones habituales:

```bash
pnpm test --runInBand --runTestsByPath test/security/braces.test.ts
```

`pnpm audit` seguirá reportando esa versión de `braces`, aunque el parche local esté aplicado. La alerta se mantiene visible, sin exclusiones. Reemplazá el parche por una versión oficial corregida cuando esté disponible, conservando los tests de regresión.

El override de `@istanbuljs/load-nyc-config>js-yaml` utiliza `js-yaml` 4, cuya API `load` es compatible con ese consumidor. Esto elimina la cadena obsoleta de `argparse` 1 y `sprintf-js`, que tampoco dispone de un parche publicado para su aviso de seguridad.

El lockfile de pnpm 12 contiene documentos separados para el gestor de paquetes y la aplicación. El análisis automático de GitHub puede leer solo el primero y omitir las dependencias del frontend. Por eso, el job `dependency-graph` del CI genera inventarios completos con `pnpm sbom`, conserva dependencias directas y transitivas y distingue el alcance de producción del de desarrollo. Después de aprobar los controles de calidad, los envía al grafo de GitHub únicamente desde la rama principal. El conversor rechaza inventarios incompletos para evitar que se pierdan dependencias en silencio.
