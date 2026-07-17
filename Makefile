.DEFAULT_GOAL := dev

COMPOSE := docker compose

.PHONY: dev down logs clean ps test typecheck lint format format-check

dev:
	$(COMPOSE) up --build dev

down:
	$(COMPOSE) down --remove-orphans

logs:
	$(COMPOSE) logs -f dev

clean:
	$(COMPOSE) down --volumes --remove-orphans

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
