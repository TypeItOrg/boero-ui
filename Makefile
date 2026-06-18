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
