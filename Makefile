include .env
export

.PHONY: build-image
build-image:
	- docker build -t blog-api:0 .

.PHONY: stop-all
stop-all:
	- docker stop pgdb
	- docker stop redis-stack
	- docker stop server

.PHONY: rm-all
rm-all:
	- docker container rm pgdb
	- docker container rm redis-stack
	- docker container rm server

.PHONY: create-network
create-network:
	docker network create blog-network

.PHONY: delete-network
delete-network:
	@if docker network inspect blog-network >/dev/null 2>&1; then \
        docker network rm blog-network; \
    else \
        echo "Network blog-network does not exist."; \
    fi

.PHONY: run-db
run-db:
	docker run -d \
		--name pgdb \
		--network blog-network \
		-v pgdata:/var/lib/postgresql/data \
		-e POSTGRES_USER=$$POSTGRES_USER \
		-e POSTGRES_PASSWORD=$$POSTGRES_PASSWORD \
		-e POSTGRES_DB=$$POSTGRES_DBNAME \
		-p 5432:5432 \
		--restart unless-stopped \
		postgres:15.1-alpine


.PHONY: run-redis
run-redis:
	docker run -d \
		--name redis-stack \
		--network blog-network \
		-p 6379:6379 \
		-p 8001:8001 \
		redis/redis-stack:latest


.PHONY: start-server
start-server:
	# Delete existing Docker image if it exists
	-docker rmi blog-api:0
	
	# Build Docker image
	docker build -t blog-api:0 .
	
	# Run Docker container
	docker run -d \
		--name server \
		--network blog-network \
		-e DATABASE_URL=postgresql://postgres:nikhil25803@pgdb:5432/postgres?schema=public \
		-e PORT=$$PORT \
		-e JWT_ACCESS_TOKEN=$$JWT_ACCESS_TOKEN \
		-e REDIS_HOST=redis-stack \
		-e REDIS_PORT=$$REDIS_PORT \
		-p 8000:8000 \
		--restart unless-stopped \
		blog-api:0
	


.PHONY: run-all
run-all:

	# Stop and remove all the running containers to avoid conflicts
	$(MAKE) stop-all
	$(MAKE) rm-all

	# Delete network with same name if exists and create a new network
	$(MAKE) delete-network
	$(MAKE) create-network

	# Running the PostgresSQL DB
	$(MAKE) run-db
	
	# Running the Redis Sever
	$(MAKE) run-redis
	
	# Running the Node Server
	$(MAKE) start-server