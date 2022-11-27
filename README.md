# justcollected.com

## Based on a NestJS Starter Kit [v2]

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![Build Badge](https://github.com/monstar-lab-oss/nestjs-starter-rest-api/workflows/build/badge.svg)
![Tests Badge](https://github.com/monstar-lab-oss/nestjs-starter-rest-api/workflows/tests/badge.svg)

This starter kit has the following outline:

- Monolithic Project.
- REST API

The baseline for this project was taken from [MonstraLab OSS template](https://github.com/monstar-lab-oss/nestjs-starter-rest-api/blob/master/README.md)

### Sample implementations

To view sample implementations based on this starter kit, please visit the
[nestjs-sample-solutions](https://github.com/monstar-lab-oss/nestjs-sample-solutions)
repository.

### Starter kit Features

One of our main principals has been to keep the starter kit as lightweight as possible.
With that in mind, here are some of the features that we have added in this starter kit.

| Feature                  | Info               | Progress |
| ------------------------ | ------------------ | -------- |
| Authentication           | JWT                | Done     |
| Authorization            | RBAC (Role based)  | Done     |
| ORM Integration          | TypeORM            | Done     |
| DB Migrations            | TypeORM            | Done     |
| Logging                  | winston            | Done     |
| Request Validation       | class-validator    | Done     |
| Pagination               | SQL offset & limit | Done     |
| Docker Ready             | Dockerfile         | Done     |
| Auto-generated OpenAPI   | -                  | Done     |
| Auto-generated ChangeLog | -                  | WIP      |

Apart from these features above, our start-kit comes loaded with a bunch of minor
awesomeness like prettier integration, commit-linting husky hooks, package import
sorting, docker-compose for database dependencies, etc.

## Pre-requesites

Before starting, make sure you have at least these on your workstation:

- [NodeJS](https://nodejs.org 'NodeJS') matching the project's version

- If you use [nvm](https://github.com/nvm-sh/nvm) just run `nvm use`.

  - If you are using `zsh` as a shell you can automate this process, and it will switch
  automatically when you change to the project directory just add this block to your`.zshrc`

  ```shrc
  # place this after nvm initialization!
  autoload -Uz add-zsh-hook

  load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
     nvm use
  elif [[ $(nvm version) != $(nvm version default)  ]]; then
     echo "Reverting to nvm default version"
     nvm use default
  fi
  }

  add-zsh-hook chpwd load-nvmrc
  load-nvmrc
  ```

- [Docker and Docker-Compose](https://www.docker.com 'Docker')
  - These are installed seperately if you are using a Linux distro;

## Setting up

Note: when using docker, all the `npm` commands can also be performed using
`./scripts/npm` (for example `./scripts/npm install`). This script allows you
to run the same commands inside the same environment and versions than the service,
without relying on what is installed on the host.

### Install dependencies

We use NPM and we disallow any attempt to use Yarn or PNPM; We recognize that Yarn
and especially PNPM are faster than NPM; But GitHub Actions PNPM support is still
somewhat limited, it is also harder to find professional grade examples using this
managers, when it comes to private packaging, CI/CD, among others.

```bash
npm install
```

### Create the environment file (.env)

- Create a `.env` file from the template `.env.template` file.

```bash
cp .env.template .env
```

- Fill in any unfilled variables.
  - See next section for `JWT_PUBLIC_KEY_BASE64` and `JWT_PRIVATE_KEY_BASE64`

### Generate public and private key pair for jwt authentication

These variables are key to the application proper operation. Without these
environment variables, the application `runtime` will fail and `e2e` will certainly
pick that up!

#### Option one (using docker)

Run this command:

```bash
./scripts/generate-jwt-keys
```

Copy the output of that command and add it to your `.env` file. It looks something
like this:

```env
To setup the JWT keys, please add the following values to your .env file:
JWT_PUBLIC_KEY_BASE64="(long base64 content)"
JWT_PRIVATE_KEY_BASE64="(long base64 content)"
```

#### Option two (using host machine functionality)

The keys will be generated on `.local` folder, which is ignored by `.gitignore`.

```bash
mkdir ./local
ssh-keygen -t rsa -b 2048 -m PEM -f ./local/jwtRS256.key -N ""
openssl rsa -in jwtRS256.key -pubout -outform PEM -out ./local/jwtRS256.key.pub
base64 -i ./local/jwtRS256.key
base64 -i ./local/jwtRS256.key.pub
```

Must enter the base64 of the key files in `.env`:

```bash
# Ensure that you insert both outputs in your environment without any newlines
JWT_PUBLIC_KEY_BASE64="BASE64_OF_JWT_PUBLIC_KEY"
JWT_PRIVATE_KEY_BASE64="BASE64_OF_JWT_PRIVATE_KEY"
```

### Running the app

We can run the project with or without docker.

#### Directly on the host machine

To run the server without Docker we need this pre-requisite:

- Postgres server running with applied migrations (we only apply and synch automatically
in E2E tests)

Commands:

```bash
# Apply the migrations if needed
npm run typeorm:migration:run

# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

#### Using docker virtualization

```bash
# build image
docker build -t justcollected .

# run container from image
docker run -p 3000:3000 --volume 'pwd':/usr/src/app --network --env-file .env justcollected

# run using docker compose
docker compose up
```

### Testing the application

```bash
# unit tests (with or without JEST coverage)
npm run test
npm run test:cov

# integration
# not available yet

# e2e tests
npm run test:e2e
```

### Migrations

```bash
# Example using docker (all remaining commands can also be used in the same way)
docker-compose exec app npm run typeorm:migration:run

# Directly on host machine
# Apply migrations on local machine
npm run typeorm:migration:run

# Revert the previous migration applied on your local machine
npm run typeorm:migration:revert

# Generate migration file from changes applied to the entities. Be aware that
# the generated file may need some fine tuning. Always verify the generated
# migration instructions as they can easily compromise dev, qa and production
# databases when applied.
npm run typeorm:migration:generate --name='name'

# Create an empty migration file
npm run typeorm:migration:create --name'name'

# Write in the console the pending changes
npm run typeorm:migration:log

# Write in the console the pending migrations to be applied
npm run typeorm:migration:show

# Drop database, deletes all tables
npm run schema:drop

# Sync entities with database, creates, and updates database tables
# We do this automatically on application start-up.
npm run schema:sync
```

## Architecture

- [Project Structure](./docs/project-structure.md)

## External Links

- [NestJS](http://nestjs.com/)

## Troubleshooting

```bash
# You must provide the correct relative or absolute path to -f option
# When prompted for a password, type in the value of DATABASE_PASSWORD of `.env`
export NODE_ENV=dev;
npm run typeorm schema:drop;
psql --dbname=$DB_NAME --username=$DB_USER --host=$DB_HOST --port=$DB_PORT -f ~/Downloads/example-dump.sql;
```
