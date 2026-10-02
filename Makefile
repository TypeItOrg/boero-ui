.DEFAULT_GOAL := dev

# Keep Compose interpolation consistent with the local service env_file.
COMPOSE := docker compose $(if $(wildcard .env.dev),--env-file .env.dev)

.PHONY: dev build down logs clean ps test typecheck lint format format-check

dev:
	@$(COMPOSE) up --watch --remove-orphans

build:
	$(COMPOSE) build

down:
	$(COMPOSE) down --remove-orphans

logs:
	$(COMPOSE) logs -f dev

clean:
	$(COMPOSE) down --remove-orphans

ps:
	$(COMPOSE) ps

test:
	pnpm test

typecheck:
	pnpm typecheck

lint:
	pnpm lint

format:
	pnpm format

format-check:
	pnpm format:check
