default:
    just --list

install:
    cp .env.dist .env
    pnpm install

# start docker database
start_db:
    docker compose up -d
    
# stop docker database
stop_db:
    docker compose down
