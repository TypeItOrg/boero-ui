# Despliegue

## Despliegue en VPS

El contenedor publica Next.js únicamente en la interfaz loopback de la VPS. Nginx es el único punto de entrada público y reenvía el tráfico desde el puerto 80.

**1.** En la VPS, clonar el repositorio o copiar los archivos de despliegue:

- `compose.prod.yaml` o `compose.staging.yaml`
- `Makefile`
- El archivo de entorno correspondiente

**2.** Crear el archivo de producción:

```bash
cp .env.prod.example .env.prod
```

**3.** Configurar `APP_VERSION` con una imagen publicada por CI:

```dotenv
APP_IMAGE=ghcr.io/typeitorg/boero-ui
APP_VERSION=sha-0123456789abcdef
APP_HOST_PORT=3000
AUTH_COOKIE_SECURE=false
BOERO_API_URL=http://host.docker.internal
```

> [!NOTE]
> `host.docker.internal` permite que Next.js llame al Nginx del host. Nginx deriva `/api/v1` al backend y el resto al frontend.

**4.** Si el paquete de GHCR es privado, autenticar Docker una sola vez:

```bash
docker login ghcr.io
# Usar un token de GitHub con permiso read:packages
```

**5.** Descargar e iniciar:

```bash
make prod
```

**6.** Verificar el despliegue:

```bash
make ps-prod
curl --fail http://127.0.0.1:3000/api/health
```

> [!TIP]
> Staging sigue el mismo proceso con `.env.staging` y `make staging`. Ambos ambientes usan el puerto loopback `3000` porque se despliegan de manera independiente.

## Nginx por HTTP

[`deploy/nginx/boero.conf.example`](../deploy/nginx/boero.conf.example) proporciona la configuración combinada para servir frontend y backend desde la misma IP.

La configuración:

- ✅ Mantiene `/api/v1` dirigido a `127.0.0.1:8080`
- 🚫 Bloquea la publicación de `/actuator`
- ➡️ Dirige el resto del tráfico a Next.js en `127.0.0.1:3000`
- 🔄 Deshabilita el buffering para conservar el streaming del App Router
- 📦 Comprime con gzip: HTML, CSS, JS, JSON, SVG y RSC (> 1 KiB)
- 🌐 Reemplaza `X-Forwarded-For` con la IP observada por Nginx

### Pasos de instalación

```bash
# Backup de la configuración actual
sudo cp /etc/nginx/sites-available/boero-api /etc/nginx/sites-available/boero-api.bak

# Instalar la nueva configuración
sudo cp deploy/nginx/boero.conf.example /etc/nginx/sites-available/boero
sudo ln -s /etc/nginx/sites-available/boero /etc/nginx/sites-enabled/boero
sudo unlink /etc/nginx/sites-enabled/boero-api

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
sudo rm /etc/nginx/sites-available/boero-api
```

Comprobar que Nginx entrega respuestas comprimidas:

```bash
curl --silent --header 'Accept-Encoding: gzip' \
  --dump-header - --output /dev/null http://<ip-del-vps>/ \
  | grep -i '^Content-Encoding: gzip'
```

Nginx solicita respuestas sin compresión a Next.js y Spring, y aplica gzip en un único lugar. El nivel `5` ofrece una buena relación entre uso de CPU y tamaño para una VPS. No se comprimen imágenes rasterizadas, fuentes WOFF2 ni otros formatos que ya incluyen compresión.

Después de validar y recargar Nginx, el único sitio activo queda en `/etc/nginx/sites-enabled/boero` y la configuración anterior se conserva únicamente como `/etc/nginx/sites-available/boero-api.bak`.

El upstream `boero_ui` apunta a `127.0.0.1:3000` tanto para staging como para producción. Si en el futuro ambos ambientes deben ejecutarse simultáneamente en la misma VPS, uno necesitará otro puerto y otro punto de entrada público o un dominio propio.

> [!WARNING]
> HTTP no cifra credenciales, tokens ni respuestas. No usar datos reales y restringir la IP mediante firewall o VPN. Solo el puerto 80 debe ser público; los puertos 3000 y 8080 deben permanecer en `127.0.0.1`.

> [!NOTE]
> `AUTH_COOKIE_SECURE=false` es necesario mientras el navegador acceda por HTTP. Al habilitar HTTPS debe cambiarse a `true`.

## Rollback

Cambiar `APP_VERSION` en el archivo de entorno a la imagen `sha-<sha-del-commit>` anterior exitosa y ejecutar:

```bash
make prod
```

Compose descarga la versión solicitada y reemplaza el contenedor. El volumen nombrado del caché de Next.js sobrevive al reemplazo.

## Notas de ejecución

| Aspecto                  | Detalle                                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Variables de entorno** | `BOERO_API_URL` es server-only y se evalúa en runtime → la misma imagen puede promoverse entre ambientes                               |
| **Seguridad**            | El contenedor corre como usuario no-root con filesystem raíz de solo lectura. Solo `/tmp` y el volumen de caché son escribibles        |
| **Health check**         | Confirma que el proceso Next.js responde. No representa el estado del backend ni de la base de datos                                   |
| **Escalabilidad**        | La configuración actual supone una instancia por ambiente. Varias réplicas requieren caché compartido y clave común para Server Actions |
