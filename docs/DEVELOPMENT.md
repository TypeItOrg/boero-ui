# Desarrollo

## Requisitos

- [Docker](https://www.docker.com/)
- [Make](https://www.gnu.org/software/make/)

## Inicio rápido

```bash
cp .env.dev.example .env.dev
make
```

La aplicación queda disponible en **http://localhost:3000**.

> [!NOTE]
> `BOERO_API_URL` debe ser accesible desde el contenedor del frontend. El ejemplo de desarrollo usa la dirección del host Docker en Linux.

## Comandos útiles

| Comando             | Descripción                    |
| ------------------- | ------------------------------ |
| `make` / `make dev` | Levantar entorno de desarrollo |
| `make test`         | Ejecutar tests                 |
| `make lint`         | Ejecutar linter                |
| `make typecheck`    | Verificar tipos                |
| `make format`       | Formatear código               |
| `make format-check` | Verificar formato              |
| `make down`         | Detener contenedores           |
| `make clean`        | Eliminar volúmenes y cachés    |
