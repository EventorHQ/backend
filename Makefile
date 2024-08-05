.PHONY: build start stop start-easy

build:
	docker-compose build

start: build
	docker-compose up

start-easy:
	docker-compose up

stop:
	docker-compose down