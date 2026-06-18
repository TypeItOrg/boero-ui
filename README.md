# Boero UI

Next.js frontend for Boero UI.

## Requirements

- Docker
- Docker Compose v2
- Make

Local Node.js and pnpm are not required for the default development workflow.

## Development

Copy the development env template once:

```bash
cp .env.development.example .env.development
```

Start the frontend:

```bash
make
```

This runs the same command as:

```bash
make dev
```

Open http://localhost:3000.

## Staging And Production

Public `NEXT_PUBLIC_*` variables are embedded into the browser bundle during `next build`, so staging and production are built separately.
When adding a new public variable, add it to the Dockerfile build args and the staging/production Compose build args as well.

Create the environment files from the templates before running these commands:

```bash
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

Run staging locally:

```bash
make staging
```

Run prod locally:

```bash
make prod
```

Build images without starting containers:

```bash
make build-staging
make build-prod
```

## Useful Commands

```bash
make down
make logs
make clean
```

`make clean` removes Docker-managed volumes for this project, including cached dependencies.
