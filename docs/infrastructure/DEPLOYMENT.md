# Despliegue

Este repositorio construye, valida y publica la imagen de `boero-ui`. La topología de los ambientes, Nginx, Compose, variables operativas, despliegues y rollbacks viven en [`boero-infra`](https://github.com/TypeItOrg/boero-infra).

## Flujo de staging

Staging conserva su configuración, pero actualmente no tiene una VPS provisionada. El job `deploy-staging` queda desactivado mediante `if: ${{ false }}`; no se intenta una conexión SSH.

Un push a `staging`:

1. Ejecuta formato, lint, tipos, tests y build.
2. Publica `ghcr.io/typeitorg/boero-ui:sha-<commit>`.
3. Omite el job de despliegue mientras no haya infraestructura.

Cuando exista una VPS y se complete la preparación de `boero-infra/docs/STAGING.md`, se podrá restaurar la condición `github.event_name == 'push' && github.ref_name == 'staging'` del job. Entonces usará el GitHub Environment `staging` y ejecutará `make deploy-ui ENV=staging VERSION=sha-<commit>` en `/opt/boero-infra`.

Ese comando actualiza únicamente la UI, espera su healthcheck y restaura automáticamente la versión anterior si el contenedor nuevo no queda saludable. Desactivar el job no elimina los perfiles, Compose, variables de ejemplo ni ramas del ambiente.

Los secretos SSH, la instalación inicial de la VPS y la operación manual están documentados en el README de `boero-infra`.

## Responsabilidades de este repositorio

- `Dockerfile`: construcción y runtime de la imagen.
- `compose.yaml`: desarrollo local.
- `.env.example`: configuración local.
- `.github/workflows/ci.yaml`: validación y publicación; el despliegue a staging queda preparado pero desactivado.

No deben agregarse aquí configuraciones de Nginx ni Compose de ambientes compartidos.

## Producción

Producción nunca tuvo una VPS provisionada y continúa preparada para uso futuro. No ejecutar el despliegue hasta disponer del servidor y completar su preparación.

`.github/workflows/deploy-production.yaml` permite un despliegue manual futuro. Requiere un SHA completo perteneciente a `main` y el GitHub Environment protegido `production`; no se ejecuta por push.

La preparación del servidor y el checklist previo al primer release viven en `docs/PRODUCTION.md` de `boero-infra`.
