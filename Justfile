default: just --list

install: cp .env.dist .env
  pnpm install

# start docker database
start_db: docker compose -f docker-compose.yml up -d
  ̀
# stop docker database
stop_db: docker compose -f docker-compose.yml down

test_integration: start_test_db && stop_test_db
  pnpm test:db:reset
  pnpm test:integration
start_test_db: docker compose -f docker-compose.test.yml up -d

stop_test_db: docker compose -f docker-compose.test.yml down

db_fixture: pnpm db:reset

db_init: pnpm db:init
