# Boero UI

Frontend de Boero construido con Next.js y empaquetado como una aplicación Node.js standalone.

## Requisitos

- Docker
- Docker Compose v2
- Make

El flujo de desarrollo predeterminado no requiere instalar Node.js ni pnpm en el host.

## Desarrollo

Crear el archivo de entorno local una sola vez:

```bash
cp .env.dev.example .env.dev
```

Iniciar el frontend:

```bash
make
```

Este comando equivale a `make dev`. La aplicación queda disponible en http://localhost:3000.

`BOERO_API_URL` debe ser accesible desde el contenedor del frontend. El ejemplo de desarrollo usa la dirección del host Docker en Linux.

## Integración continua

GitHub Actions verifica los pushes y pull requests dirigidos a `develop`, `staging` y `main`. El pipeline controla formato, lint, tipos, tests y el build de producción.

Los pushes a `staging` y `main` también publican dos imágenes en GitHub Container Registry:

```text
ghcr.io/typeitorg/boero-ui:sha-<sha-del-commit>
ghcr.io/typeitorg/boero-ui:<rama>
```

Los despliegues deben usar la etiqueta inmutable `sha-<sha-del-commit>`. La etiqueta de rama es solamente un puntero conveniente a la última imagen exitosa.

## Despliegue en una VPS

El contenedor publica Next.js únicamente en la interfaz loopback de la VPS. Nginx es el único punto de entrada público y reenvía el tráfico desde el puerto 80.

En la VPS, clonar el repositorio o copiar estos archivos de despliegue:

- `compose.prod.yaml` o `compose.staging.yaml`;
- `Makefile`;
- el archivo de entorno correspondiente.

Crear el archivo de producción:

```bash
cp .env.prod.example .env.prod
```

Configurar `APP_VERSION` con una imagen publicada por CI:

```dotenv
APP_IMAGE=ghcr.io/typeitorg/boero-ui
APP_VERSION=sha-0123456789abcdef
APP_HOST_PORT=3000
AUTH_COOKIE_SECURE=false
BOERO_API_URL=http://host.docker.internal
```

`host.docker.internal` permite que Next.js llame al Nginx del host. Nginx deriva `/api/v1` al backend y el resto al frontend.

Si el paquete de GHCR es privado, autenticar Docker una sola vez con un token de GitHub que tenga el permiso `read:packages`:

```bash
docker login ghcr.io
```

Descargar e iniciar la imagen seleccionada:

```bash
make prod
```

Verificar el despliegue antes de habilitar el tráfico público:

```bash
make ps-prod
curl --fail http://127.0.0.1:3000/api/health
```

Staging sigue el mismo proceso con `.env.staging` y `make staging`. Su puerto loopback predeterminado es `3001`.

## Nginx por HTTP

[`deploy/nginx/boero.conf.example`](deploy/nginx/boero.conf.example) reemplaza la configuración exclusiva del API cuando frontend y backend se publican mediante la misma IP. Una sola IP y el puerto 80 no pueden tener dos sitios `default_server` independientes.

La configuración combinada:

- mantiene `/api/v1` dirigido a `127.0.0.1:8080`;
- bloquea la publicación de `/actuator`;
- dirige el resto del tráfico a Next.js en `127.0.0.1:3000`;
- deshabilita el buffering para conservar el streaming del App Router;
- reemplaza `X-Forwarded-For` con la IP observada por Nginx.

Instalarla en lugar del sitio actual del API y validar Nginx antes de recargarlo:

```bash
sudo cp deploy/nginx/boero.conf.example /etc/nginx/sites-available/boero
sudo ln -s /etc/nginx/sites-available/boero /etc/nginx/sites-enabled/boero
sudo unlink /etc/nginx/sites-enabled/boero-api
sudo nginx -t
sudo systemctl reload nginx
```

El comando `unlink` sólo corresponde si el enlace actual se llama `boero-api`. No se deben dejar activas simultáneamente ambas configuraciones porque las dos intentarían ocupar el sitio predeterminado del puerto 80.

El ejemplo apunta al frontend de producción en el puerto `3000`. Para publicar staging en su lugar, cambiar el upstream `boero_ui` a `127.0.0.1:3001`. Publicar ambos ambientes simultáneamente mediante una sola IP requiere asignar otro puerto público a uno de ellos o incorporar dominios.

Por el momento el acceso es HTTP y no requiere dominio ni certificados. HTTP no cifra credenciales, tokens ni respuestas: no se deben usar datos reales y conviene restringir la IP mediante firewall o VPN siempre que sea posible. Sólo el puerto 80 debe ser público; los puertos 3000, 3001 y 8080 permanecen ligados a `127.0.0.1`.

`AUTH_COOKIE_SECURE=false` es necesario mientras el navegador acceda por HTTP. Al habilitar HTTPS debe cambiarse a `true`.

## Rollback

Cambiar `APP_VERSION` en el archivo de entorno a la imagen `sha-<sha-del-commit>` exitosa anterior y ejecutar nuevamente:

```bash
make prod
```

Compose descarga la versión solicitada y reemplaza el contenedor. El volumen nombrado del caché de Next.js sobrevive al reemplazo.

## Migración futura a Vercel

La aplicación continúa siendo un proyecto Next.js estándar y no depende de APIs exclusivas de la VPS. Para desplegarla en Vercel se necesita principalmente:

1. conectar el repositorio;
2. configurar `BOERO_API_URL` con una dirección del backend accesible desde Internet;
3. omitir `AUTH_COOKIE_SECURE` o establecerlo en `true`;
4. conservar o desactivar la publicación de imágenes Docker según se siga usando la VPS como alternativa.

El Dockerfile, los archivos Compose y Nginx no interfieren con Vercel. `output: "standalone"` pertenece al empaquetado autocontenido y no introduce dependencias en el código de la aplicación. Como las llamadas al API pasan por el servidor Next.js, el navegador tampoco necesita acceder directamente al backend ni resolver CORS contra él.

## Notas de ejecución

- `BOERO_API_URL` es server-only y se evalúa en runtime, por lo que la misma imagen puede promoverse entre ambientes.
- El contenedor corre como usuario no-root con filesystem raíz de sólo lectura. Únicamente `/tmp` y el volumen de caché de Next.js son escribibles.
- El health check confirma que el proceso Next.js responde. No representa el estado del backend ni de la base de datos.
- La configuración actual supone una instancia de Next.js por ambiente. Varias réplicas requieren caché compartido, una clave común para Server Actions y protección contra diferencias de versión durante el despliegue.

## Comandos útiles

```bash
make down
make logs
make logs-staging
make logs-prod
make ps
make ps-staging
make ps-prod
make clean
```

`make clean` elimina los volúmenes administrados por Docker, incluidos los cachés persistentes de Next.js.
