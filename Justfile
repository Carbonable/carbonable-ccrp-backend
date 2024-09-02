default: 
    just --list


install:
    pnpm install
    npx prisma generate

init: install start_db 
    pnpm run build
    
init_test: install start_test_db 
    pnpm run build
    
check_env:
  @if [ ! -f .env ]; then \
    echo ".env file not found. Please create it and set the required environment variables."; \
    exit 1; \
  fi
  @bash -c 'for var in DATABASE_URL CARBONABLE_SALT ORG_ID NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY; do \
    value=$(grep "^$$var=" .env | cut -d "=" -f2-); \
    if [ -z "$$value" ] || [[ "$$value" == *"by_clerk"* ]]; then \
      echo "Error: Please set the value for $$var properly."; \
      exit 1; \
    fi; \
  done'
  @echo "All environment variables are set correctly."


### DATABASE MANAGEMENT
start_db: 
    docker compose -f docker-compose.yml up -d


stop_db: 
    docker compose -f docker-compose.yml down

start_test_db: 
    docker compose -f docker-compose.test.yml up -d

stop_test_db: 
    docker compose -f docker-compose.test.yml down

db_fixture: 
    pnpm db:reset
db_init: 
    pnpm db:init


### TESTING
test_integration: check_env  start_test_db 
    pnpm test:db:reset
    pnpm test:integration
    
test_coverage: 
    pnpm test:cov

### DEPLOYEMENT ON Fly
deploy_debug:
        fly deploy -c fly.debug.toml 
deploy_staging:
        fly deploy -c fly.staging.toml 


studio:
    npx prisma studio
