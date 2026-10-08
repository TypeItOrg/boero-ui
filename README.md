<div align="center">

<br />
<img src="public/brand/logo.svg" alt="Boero" width="80" height="80" />

# Boero

**Interfaz web de la plataforma de gestión académica y administrativa para conservatorios superiores de música.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-4-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

[![Node.js](https://img.shields.io/badge/Node.js-24_Alpine-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11.10-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Jest](https://img.shields.io/badge/Jest-30-C21325?style=flat-square&logo=jest&logoColor=white)](https://jestjs.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![GHCR](https://img.shields.io/badge/Registry-GHCR-181717?style=flat-square&logo=github&logoColor=white)](https://ghcr.io)

_Centraliza información, reduce errores y ofrece una experiencia consistente para docentes, estudiantes y equipos administrativos._

</div>

## Desarrollo local

Con la API local configurada y en ejecución:

```bash
test -f .env.dev || cp .env.example .env.dev
make dev
```

Make utiliza `.env.dev` también para la interpolación de Compose cuando el archivo
existe. Mantener `FRONTEND_PUBLIC_URL` e `INSTITUTIONAL_BASE_DOMAIN` alineados con la API:

```dotenv
FRONTEND_PUBLIC_URL=http://localhost:3000
INSTITUTIONAL_BASE_DOMAIN=localhost
```

- Acceso general: `http://localhost:3000`, con selector de institución.
- Acceso institucional: `http://cboero.localhost:3000`, con nombre público `cboero`
  configurado y sin selector.
- Administración de plataforma: sólo desde el acceso general. Sus rutas en un
  subdominio institucional redirigen al login institucional.

No hay cambio ni redirección del hostname local. La API usa `WEBAUTHN_RP_ID=localhost`
y `WEBAUTHN_ALLOWED_ORIGINS=http://localhost:3000` para el acceso general. En los
subdominios institucionales locales resuelve un RP ID propio desde el origen validado.

Una passkey registrada en `localhost` no se usa en `cboero.localhost` y viceversa.
Ingresar con contraseña en el acceso institucional y registrar allí una llave nueva,
sin eliminar las existentes ni los datos locales. Esta separación por hostname es
local: los ambientes públicos conservan su RP ID común configurado.
