# Despliegue

Este repositorio construye, valida y publica la imagen de `boero-ui`. La topología de los ambientes, Nginx, Compose, variables operativas, despliegues y rollbacks viven en [`boero-infra`](https://github.com/TypeItOrg/boero-infra).

## Flujo de staging

Un push a `staging`:

1. Ejecuta formato, lint, tipos, tests y build.
2. Publica `ghcr.io/typeitorg/boero-ui:sha-<commit>`.
3. Se conecta a la VPS mediante el GitHub Environment `staging`.
4. Ejecuta `make deploy-ui ENV=staging VERSION=sha-<commit>` en `/opt/boero-infra`.

Infra actualiza únicamente la UI, espera su healthcheck y restaura automáticamente la versión anterior si el contenedor nuevo no queda saludable.

Los secretos SSH, la instalación inicial de la VPS y la operación manual están documentados en el README de `boero-infra`.

## Responsabilidades de este repositorio

- `Dockerfile`: construcción y runtime de la imagen.
- `compose.yaml`: desarrollo local.
- `.env.dev.example`: configuración local.
- `.github/workflows/ci.yaml`: validación, publicación y disparo del despliegue de UI.

No deben agregarse aquí configuraciones de Nginx ni Compose de ambientes compartidos.

## Producción

`.github/workflows/deploy-production.yaml` permite un despliegue manual futuro. Requiere un SHA completo perteneciente a `main` y el GitHub Environment protegido `production`; no se ejecuta por push.

La preparación del servidor y el checklist previo al primer release viven en `docs/PRODUCTION.md` de `boero-infra`.
