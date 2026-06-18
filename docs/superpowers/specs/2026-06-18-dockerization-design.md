# Dockerization Design

Date: 2026-06-18

## Goal

Dockerize the Next.js application so the team can run the frontend without installing local Node.js dependencies. The default workflow must be as simple as running `make`, which starts the development server through Docker Compose.

The setup must also support staging and production builds with a deploy-ready Docker image optimized for Next.js self-hosting.

## Current Context

- The project is a Next.js 16 App Router application.
- The package manager is pnpm, with `pnpm-lock.yaml` committed.
- Existing scripts are `dev`, `build`, `start`, and `lint`.
- There is no existing Dockerfile, Compose file, Makefile, or environment file.
- `next.config.ts` currently has no production deployment settings.

## Environment Model

Development, staging, and production will share one Dockerfile.

Development prioritizes fast feedback and hot reload:

- `make` and `make dev` start the app at `localhost:3000`.
- Source code is bind-mounted into the container.
- `node_modules` lives in a Docker-managed volume so contributors do not install dependencies locally.
- The container runs `pnpm dev`.

Staging and production prioritize deployable images:

- `make staging` builds and runs the staging image.
- `make prod` builds and runs the production image.
- Each environment uses its own env file, for example `.env.staging` and `.env.production`.
- Public browser variables such as `NEXT_PUBLIC_API_URL` are supplied during image build because Next.js embeds `NEXT_PUBLIC_*` values into the client bundle at build time.

## Dockerfile Design

Use a single multi-stage `Dockerfile` with these stages:

- `base`: shared Node.js image setup, working directory, pnpm through Corepack, and common environment defaults.
- `deps`: install dependencies from `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` using Docker BuildKit cache mounts for the pnpm store.
- `dev`: install dependencies and run `pnpm dev` with bind-mounted source.
- `builder`: copy dependencies and source, receive build arguments for the selected environment, and run `pnpm build`.
- `prod`: minimal production runtime image using the Next.js standalone output, non-root user, and `node server.js`.

`next.config.ts` will enable:

```ts
output: "standalone"
```

This follows the local Next.js self-hosting documentation. The production runtime will copy only:

- `.next/standalone`
- `.next/static`
- `public`

The runtime will expose port `3000` and set `HOSTNAME=0.0.0.0` so Docker can route traffic into the container.

## Compose Design

Use Compose files that keep development simple and production explicit:

- `compose.yaml`: default development stack.
- `compose.staging.yaml`: staging build and runtime configuration.
- `compose.prod.yaml`: prod build and runtime configuration.

Development Compose service:

- Builds the `dev` target.
- Mounts the project source into `/app`.
- Uses named volumes for `/app/node_modules` and the pnpm store.
- Maps `3000:3000`.

Staging and production Compose services:

- Build the same Dockerfile with the `prod` runtime target.
- Pass the relevant `NEXT_PUBLIC_*` values as build args.
- Load runtime environment from the corresponding env file.
- Map `3000:3000` by default for local validation.

## Makefile Design

The Makefile provides the team-facing interface:

- `make`: alias for `make dev`.
- `make dev`: run the development Compose stack.
- `make staging`: build and run the staging Compose stack.
- `make prod`: build and run the production Compose stack.
- `make down`: stop all local Compose services.
- `make logs`: follow development logs.
- `make build-staging`: build staging without starting it.
- `make build-prod`: build production without starting it.
- `make clean`: remove containers, networks, and named volumes created by the project.

The Makefile will use Docker Compose v2 syntax: `docker compose`.

## Build Performance

The build will be optimized with:

- Layer ordering that copies lockfiles before application source.
- BuildKit cache mounts for pnpm's store.
- A separate dependency layer reused by development and production builds.
- Next.js standalone output to shrink runtime image size.
- A `.dockerignore` file excluding local dependencies, build output, git metadata, logs, and local-only files.

## Deploy Readiness

The production image is suitable for CI or server deployment because it:

- Is built from a deterministic lockfile install.
- Runs as a non-root user.
- Contains only traced runtime files from Next.js standalone output.
- Does not require `pnpm install` or source files at runtime.

Staging and production images are built separately because public client-side environment variables differ per environment.

If the team later needs to promote the exact same image across environments, the app should move public runtime configuration behind a server-served config endpoint instead of using direct `NEXT_PUBLIC_*` values.

## Verification

Implementation should be verified with:

- `docker compose config`
- `make dev`
- `make staging`
- `make prod`
- `pnpm lint`, either locally if dependencies exist or inside the development container

Successful verification means the app is reachable on `localhost:3000` for development, staging, and production flows.

## Out Of Scope

- Reverse proxy configuration such as nginx or Traefik.
- Kubernetes or cloud-specific deployment manifests.
- Shared cache coordination for multi-instance ISR or cache tags.
- Runtime public configuration that avoids per-environment builds.
