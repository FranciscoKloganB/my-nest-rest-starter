# my-nest-rest-starter.com

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![Build Badge](https://github.com/monstar-lab-oss/nestjs-starter-rest-api/workflows/build/badge.svg)
![Tests Badge](https://github.com/monstar-lab-oss/nestjs-starter-rest-api/workflows/tests/badge.svg)

## Make this template your own

The very first step you must take in this project is simple:

- Find all occurrences of `my-nest-rest-starter`
- Replace them with your project's name composed of characters matching the regex:
  - `/^[(a-z\-){+}]$/` (at least one character, all being lower case or hyphen)

- Then go to your project's GitHub repository
  - Under `Settings`, select `Environments` and create new environments
    - To run the project's pipeline without any adaption we recommend `test`, `staging`
    and, `production` being created; With these exact names!
  - Under `Settings`, select `Secrets > Actions` and create two `Environment`
  per each of the previously added environments:
    - `JWT_PRIVATE_KEY_BASE64`
    - `JWT_PUBLIC_KEY_BASE64`
    - You can leave them as blank strings for now;
      - We will teach you how to fill these in a later section:
      [generating pub/priv keys](#generate-public-and-private-key-pair-for-jwt-authentication)
  - If you decide to keep on using `Dependabot`, non secret-environment variables which
  are not hard-coded on workflow files, as well as secret variables (environment,
  repository, and/or organization), must also be added to `Secrets > Actions > Dependabot`,
  otherwise the `Dependabot` Pull Requests will constantly fail. For the initial setup
  only the two variables above, need to be added to `Dependabot Secrets`.

## Before you read further

Wether you are on MacOS or Linux, we recommend that you install the following tooling:

- [oh-my-zsh](https://ohmyz.sh/) with your favorite plugins

  ```.zshrc
  # We personally enjoy using at least these:
  plugins=(
    git
    zsh-autosuggestions
    zsh-completions
    zsh-syntax-highlighting
  )
  ```

- [Homebrew](https://brew.sh/) and remember to follow the instructions at the end of the
program output.
  - Installing Homebrew and installing casks (programs) managed by Homebrew often
  require exporting environment variables, adding scripts, or similar in your `.zshrc`,
  `.bashrc` or other profile files.
  - **Always check the program output for further instructions!**

  ```sh
  brew install openssl
  brew install direnv
  # Directory Environment requires additional setup in your rc file
  brew install libpq
  # Node Version Manager requires additional setup in your rc file
  brew install nvm
  # Installs the latest Node LTS that satisfies the `.nvmrc` file given by the project
  nvm use
  ```

## Project Requesites

If you installed `nvm` and `libpq` you do not need anything other than `Docker` and
`Docker-Compose`.

- [Docker and Docker-Compose](https://www.docker.com 'Docker')
  - These are installed seperately if you are using a Linux distro;

- [NodeJS](https://nodejs.org 'NodeJS') matching the project's version

  - If you use [nvm](https://github.com/nvm-sh/nvm) and `zsh` as a shell you can
  automate process of installing and/or setting the proper `Node` for any project which
  provides `.nvmrc`, when switching to it's directory or a child of it. Just add this
  block to your`.zshrc`

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

- [Postgres](https://www.postgresql.org/) or compatible binaries

## Setting up

_When using docker, all of the project's '`npm` commands can also be performed using
`./scripts/npm` (e.g.: `./scripts/npm install`). This script allows you to run the same
commands inside the same environment and versions than the service, without relying on
what is installed on the host and without decorating fancy docker/docker-compose exec
commands._

### Install dependencies

We use NPM and we disallow any attempt to use Yarn or PNPM; We recognize that Yarn
and especially PNPM are faster than NPM; But GitHub Actions PNPM support is still
somewhat limited, it is also harder to find professional grade examples using these
managers, when it comes to private packaging, CI/CD, among others.

```sh
npm install
```

### Create the environment file (.env)

- Create a `.env` file from the template `.env.template` file.

```sh
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

```sh
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

```sh
mkdir ./local
ssh-keygen -t rsa -b 2048 -m PEM -f ./local/jwtRS256.key -N ""
openssl rsa -in jwtRS256.key -pubout -outform PEM -out ./local/jwtRS256.key.pub
base64 -i ./local/jwtRS256.key
base64 -i ./local/jwtRS256.key.pub
```

Must enter the base64 of the key files in `.env`:

```sh
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

```sh
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

```sh
# build image
docker build -t my-nest-rest-starter .

# run container from image
docker run -p 3000:3000 --volume 'pwd':/usr/src/app --network --env-file .env my-nest-rest-starter

# run using docker compose
docker compose up
```

### Testing the application

```sh
# unit tests (with or without JEST coverage)
npm run test
npm run test:cov

# integration
# not available yet

# e2e tests
npm run test:e2e
```

### Migrations

```sh
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

## CI/CD and Deployments

Any environment variable which is not a secret or is just a placeholder for test should be added to any workflows (`.github/workflows/*.yml` files) as the project grows.

- See [tests-workflow.yml example](https://github.com/FranciscoKloganB/nest-rest-starter/.github/workflows/tests-workflow.yml#L18);
  - Note that some of the environment variables which are hard-coded here are typically **secret**
  - But since these are used only during the `testing-workflow` and do not communicate with real systems, and instead communicate with transient dockerized containers (running as local processes on the host where the workflow is executing), they do not need to be treated as such!

Any environment variable considered secret should be added as `Environment, Repository or Organization Secret` on GitHub. Examples include API KEYS, Database Connection Credentials, Public/Private Key pairs like the ones we created earlier (`JWT_PRIVATE_KEY_BASE64`/`JWT_PUBLIC_KEY_BASE64`)

- See [build-workflow example](https://github.com/FranciscoKloganB/nest-rest-starter/.github/workflows/build-workflow.yml#L17), which accesses the `staging` environment variables to load them into the workflow.
- You can find the secrets dashboard at  `(repository) Settings > Secrets > Actions`
- Any secret environment variable required to run the `testing` workflows, which is not hardcoded on the workflow itself should also be added a Dependabot Secrets. By default, pull requests created by Dependabot do not have access to any GitHub Secrets (for security purposes). Without this effort, all Dependabot pull requests will fail on the testing step!

## Architecture

- [Project Structure](./docs/project-structure.md)

## External Links

- [NestJS](http://nestjs.com/)
- [MonstraLab OSS template](https://github.com/monstar-lab-oss/nestjs-starter-rest-api/blob/master/README.md)

## Troubleshooting

```sh
# You must provide the correct relative or absolute path to -f option
# When prompted for a password, type in the value of DATABASE_PASSWORD of `.env`
export NODE_ENV=dev;
npm run typeorm schema:drop;
psql --dbname=$DB_NAME --username=$DB_USER --host=$DB_HOST --port=$DB_PORT -f ~/Downloads/example-dump.sql;
```

## Acknowledgements

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
