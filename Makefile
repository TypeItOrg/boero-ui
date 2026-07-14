.DEFAULT_GOAL := dev

COMPOSE := docker compose

.PHONY: dev staging prod down logs logs-staging logs-prod clean ps ps-dev ps-staging ps-prod test typecheck lint format format-check

dev:
	$(COMPOSE) up --build dev

staging:
	$(COMPOSE) --env-file .env.staging -f compose.staging.yaml pull staging
	$(COMPOSE) --env-file .env.staging -f compose.staging.yaml up -d staging

prod:
	$(COMPOSE) --env-file .env.prod -f compose.prod.yaml pull prod
	$(COMPOSE) --env-file .env.prod -f compose.prod.yaml up -d prod

down:
	$(COMPOSE) down --remove-orphans
	APP_VERSION=unused BOERO_API_URL=http://unused $(COMPOSE) -f compose.staging.yaml down --remove-orphans
	APP_VERSION=unused BOERO_API_URL=http://unused $(COMPOSE) -f compose.prod.yaml down --remove-orphans

logs:
	$(COMPOSE) logs -f dev

logs-staging:
	$(COMPOSE) --env-file .env.staging -f compose.staging.yaml logs -f staging

logs-prod:
	$(COMPOSE) --env-file .env.prod -f compose.prod.yaml logs -f prod

clean:
	$(COMPOSE) down --volumes --remove-orphans
	APP_VERSION=unused BOERO_API_URL=http://unused $(COMPOSE) -f compose.staging.yaml down --volumes --remove-orphans
	APP_VERSION=unused BOERO_API_URL=http://unused $(COMPOSE) -f compose.prod.yaml down --volumes --remove-orphans

ps:
	$(COMPOSE) ps

ps-dev:
	$(COMPOSE) ps

ps-staging:
	$(COMPOSE) --env-file .env.staging -f compose.staging.yaml ps

ps-prod:
	$(COMPOSE) --env-file .env.prod -f compose.prod.yaml ps

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
