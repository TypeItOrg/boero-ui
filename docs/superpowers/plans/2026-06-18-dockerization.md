# Dockerization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dockerize the Next.js app so `make` starts development with Docker Compose, while staging and production use optimized deploy-ready builds.

**Architecture:** Use one multi-stage `Dockerfile` with `dev`, `builder`, and `prod` stages. Dev uses bind mounts and Docker-managed dependency volumes; staging and prod build environment-specific standalone Next.js images because `NEXT_PUBLIC_*` values are embedded at build time.

**Tech Stack:** Next.js 16, React 19, pnpm, Docker BuildKit, Docker Compose v2, GNU Make.

## Global Constraints

- The default workflow must be `make`, which aliases `make dev`.
- Development must not require contributors to install Node.js dependencies locally.
- Use one Dockerfile for development, staging, and production.
- Use Next.js `output: "standalone"` for deploy-ready runtime images.
- Staging and production builds are separate because `NEXT_PUBLIC_*` differs per environment.
- Use Docker Compose v2 syntax: `docker compose`.
- Do not commit changes unless the user explicitly requests a commit.

---

## File Structure

- Create `Dockerfile`: single multi-stage Dockerfile for development and optimized runtime images.
- Create `.dockerignore`: reduce Docker build context and prevent local artifacts from entering images.
- Create `compose.yaml`: default development stack used by `make` and `make dev`.
- Create `compose.staging.yaml`: staging stack with staging env file and build args.
- Create `compose.prod.yaml`: prod stack with production env file and build args.
- Create `.env.example`: documented variables shared by all environments.
- Create `.env.dev.example`: dev defaults.
- Create `.env.staging.example`: staging template.
- Create `.env.prod.example`: prod template.
- Create `Makefile`: team-facing commands.
- Modify `.gitignore`: keep real env files ignored while allowing env templates to be versioned.
- Modify `package.json`: pin pnpm through `packageManager` for Corepack reproducibility.
- Modify `next.config.ts`: enable standalone output.
- Modify `README.md`: replace default bootstrapped instructions with Docker workflow.

---

### Task 1: Next.js Standalone Runtime Configuration

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: Next.js build system.
- Produces: `.next/standalone/server.js` during `pnpm build`, used by Docker `prod` stage.

- [ ] **Step 1: Update Next config**

Replace `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 2: Verify config compiles**

Run: `pnpm build`

Expected: build completes and creates `.next/standalone/server.js`.

---

### Task 2: Docker Build Context And Multi-Stage Image

**Files:**
- Create: `.dockerignore`
- Create: `Dockerfile`
- Modify: `package.json`

**Interfaces:**
- Consumes: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, Next.js standalone output from Task 1.
- Produces: Docker targets `dev` and `prod`.

- [ ] **Step 1: Add `.dockerignore`**

Create `.dockerignore` with:

```dockerignore
.git
.next
node_modules
dist
coverage
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.env
.env.*
!.env.example
!.env.*.example
docs/superpowers
```

- [ ] **Step 2: Add `Dockerfile`**

Create `Dockerfile` with:

```dockerfile
# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS dev
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm dev --hostname 0.0.0.0"]

FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
RUN test -n "$NEXT_PUBLIC_API_URL"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache pnpm build

FROM node:24-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 3: Verify Dockerfile parses**

Add this top-level field to `package.json` after `"private": true`:

```json
"packageManager": "pnpm@11.7.0"
```

- [ ] **Step 4: Verify Dockerfile parses**

Run: `docker build --target dev -t boero-ui:dev .`

Expected: image builds successfully through the `dev` target.

---

### Task 3: Compose Stacks For Development, Staging, And Production

**Files:**
- Create: `compose.yaml`
- Create: `compose.staging.yaml`
- Create: `compose.prod.yaml`

**Interfaces:**
- Consumes: Docker targets from Task 2 and env files from Task 4.
- Produces: Compose services `dev`, `staging`, and `prod` with container names `boero-ui-dev`, `boero-ui-staging`, and `boero-ui-prod`.

- [ ] **Step 1: Add development Compose file**

Create `compose.yaml` with:

```yaml
services:
  dev:
    container_name: boero-ui-dev
    build:
      context: .
      target: dev
    ports:
      - "3000:3000"
    env_file:
      - path: .env.dev
        required: false
    environment:
      NEXT_TELEMETRY_DISABLED: "1"
    volumes:
      - .:/app
      - node_modules:/app/node_modules
      - pnpm_store:/pnpm/store
      - next_cache:/app/.next

volumes:
  node_modules:
  pnpm_store:
  next_cache:
```

- [ ] **Step 2: Add staging Compose file**

Create `compose.staging.yaml` with:

```yaml
services:
  staging:
    container_name: boero-ui-staging
    build:
      context: .
      target: prod
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:?NEXT_PUBLIC_API_URL is required at build time}
    image: boero-ui:staging
    ports:
      - "3000:3000"
    env_file:
      - path: .env.staging
        required: false
    environment:
      NODE_ENV: production
      NEXT_TELEMETRY_DISABLED: "1"
```

- [ ] **Step 3: Add production Compose file**

Create `compose.prod.yaml` with:

```yaml
services:
  prod:
    container_name: boero-ui-prod
    build:
      context: .
      target: prod
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:?NEXT_PUBLIC_API_URL is required at build time}
    image: boero-ui:prod
    ports:
      - "3000:3000"
    env_file:
      - path: .env.prod
        required: false
    environment:
      NODE_ENV: production
      NEXT_TELEMETRY_DISABLED: "1"
```

- [ ] **Step 4: Verify Compose syntax**

Run: `docker compose config`

Expected: normalized Compose config prints with service `dev` and container name `boero-ui-dev`.

---

### Task 4: Environment Templates

**Files:**
- Modify: `.gitignore`
- Create: `.env.example`
- Create: `.env.dev.example`
- Create: `.env.staging.example`
- Create: `.env.prod.example`

**Interfaces:**
- Consumes: Compose env loading from Task 3.
- Produces: documented environment variable templates.

- [ ] **Step 1: Add shared env example**

Ensure `.gitignore` keeps real env files ignored while allowing examples:

```gitignore
.env*
!.env.example
!.env.*.example
```

- [ ] **Step 2: Add shared env example**

Create `.env.example` with:

```dotenv
# Public variables are embedded into the browser bundle during `next build`.
NEXT_PUBLIC_API_URL=http://localhost:3000
```

- [ ] **Step 3: Add development env example**

Create `.env.dev.example` with:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

- [ ] **Step 4: Add staging env example**

Create `.env.staging.example` with:

```dotenv
NEXT_PUBLIC_API_URL=https://staging-api.example.com
```

- [ ] **Step 5: Add production env example**

Create `.env.prod.example` with:

```dotenv
NEXT_PUBLIC_API_URL=https://api.example.com
```

- [ ] **Step 6: Create local dev env if absent**

If `.env.dev` does not exist, create it with:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Do not create `.env.staging` or `.env.prod` with real secrets.

---

### Task 5: Makefile Developer Interface

**Files:**
- Create: `Makefile`

**Interfaces:**
- Consumes: Compose files from Task 3.
- Produces: commands `make`, `make dev`, `make staging`, `make prod`, `make down`, `make logs`, `make build-staging`, `make build-prod`, and `make clean`.

- [ ] **Step 1: Add Makefile**

Create `Makefile` with:

```makefile
.DEFAULT_GOAL := dev

COMPOSE := docker compose

.PHONY: dev staging prod down logs build-staging build-prod clean

dev:
	$(COMPOSE) up --build dev

staging:
	$(COMPOSE) --env-file .env.staging -f compose.staging.yaml up --build staging

prod:
	$(COMPOSE) --env-file .env.prod -f compose.prod.yaml up --build prod

down:
	$(COMPOSE) down --remove-orphans
	NEXT_PUBLIC_API_URL=unused $(COMPOSE) -f compose.staging.yaml down --remove-orphans
	NEXT_PUBLIC_API_URL=unused $(COMPOSE) -f compose.prod.yaml down --remove-orphans

logs:
	$(COMPOSE) logs -f dev

build-staging:
	$(COMPOSE) --env-file .env.staging -f compose.staging.yaml build staging

build-prod:
	$(COMPOSE) --env-file .env.prod -f compose.prod.yaml build prod

clean:
	$(COMPOSE) down --volumes --remove-orphans
	NEXT_PUBLIC_API_URL=unused $(COMPOSE) -f compose.staging.yaml down --volumes --remove-orphans
	NEXT_PUBLIC_API_URL=unused $(COMPOSE) -f compose.prod.yaml down --volumes --remove-orphans
```

- [ ] **Step 2: Verify Makefile command discovery**

Run: `make -n`

Expected: prints `docker compose up --build dev` without executing it.

---

### Task 6: Documentation And End-To-End Verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: all files from Tasks 1-5.
- Produces: contributor-facing Docker workflow documentation.

- [ ] **Step 1: Update README**

Replace `README.md` with:

```markdown
# Boero UI

Next.js frontend for Boero UI.

## Requirements

- Docker
- Docker Compose v2
- Make

Local Node.js and pnpm are not required for the default development workflow.

## Development

Copy the dev env template once:

```bash
cp .env.dev.example .env.dev
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

Create the environment files from the templates before running these commands:

```bash
cp .env.staging.example .env.staging
cp .env.prod.example .env.prod
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
```

- [ ] **Step 2: Verify default Compose config**

Run: `docker compose config`

Expected: config includes `frontend`, `node_modules`, `pnpm_store`, and `next_cache`.

- [ ] **Step 3: Verify development target**

Run: `docker build --target dev -t boero-ui:dev .`

Expected: image builds successfully.

- [ ] **Step 4: Verify production target with example public env**

Run: `docker build --target prod --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000 -t boero-ui:prod-test .`

Expected: image builds successfully and includes standalone Next.js output.

- [ ] **Step 5: Verify lint**

Run: `pnpm lint`

Expected: lint passes.

- [ ] **Step 6: Review final diff**

Run: `git diff -- Dockerfile .dockerignore compose.yaml compose.staging.yaml compose.prod.yaml Makefile next.config.ts README.md package.json .gitignore .env.example .env.dev.example .env.staging.example .env.prod.example docs/superpowers/specs/2026-06-18-dockerization-design.md docs/superpowers/plans/2026-06-18-dockerization.md`

Expected: diff contains only the Dockerization changes described in this plan.
