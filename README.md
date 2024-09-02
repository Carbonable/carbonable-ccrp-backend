# Project Name

## Description

This project is built using the [Nest](https://github.com/nestjs/nest) framework, leveraging TypeScript to create a robust and scalable server-side application.
CCRP is used to

## Requirements

- [Node.js](https://nodejs.org/)
- [Just](https://github.com/casey/just#installation)
- Docker

## Installation

```bash
just install
```

## Environment Setup

Ensure that the `.env` file is set up correctly:

```bash
just check_env
```

### .env.template

```plaintext
DATABASE_URL="postgresql://test:test@localhost:5432/carbonable_ccpm_test"
# In Clerk dashboard / Organization
ORG_ID='org_id_by_clerk'
# In Clerk dashboard / organizations API keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='pk_test_by_clerk'
CLERK_SECRET_KEY='sk_test_by_clerk'
```

## Running the App

```bash
# Start the database
just start_db

# Stop the database
just stop_db
```

## Testing

Integration test scripts

```bash
just test_integration
```

Coverage test

```bash
just test_integration
```

## Database Management

```bash
# Reset Database
just db_fixture

# Initialize Database
just db_init
```

## Prisma Studio

Ui of database (link: http://localhost:5555)

```bash
just studio
```

## Deployment

Deployment to fly.

```bash
# Deploy to Debug Environment
just deploy_debug

# Deploy to Staging Environment
just deploy_staging
```

## License

This project is [MIT licensed](LICENSE).
