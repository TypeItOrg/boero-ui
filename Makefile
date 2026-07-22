.DEFAULT_GOAL := dev

COMPOSE := docker compose

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
