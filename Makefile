.PHONY: start-bot start-api end-bot end-api start end

include .env
export $(shell sed 's/=.*//' .env)

start-bot:
	docker-compose -f ./bot/docker-compose.yml up -d

start-api:
	docker-compose -f ./api/docker-compose.yml up

end-bot:
	docker-compose -f ./bot/docker-compose.yml down

end-api:
	docker-compose -f ./api/docker-compose.yml down

start: start-bot start-api

end: end-bot end-api
