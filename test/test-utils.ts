import type { INestApplication } from "@nestjs/common"
import { HttpStatus } from "@nestjs/common"
import request from "supertest"
import { DataSource } from "typeorm"

import { ROLE } from "@src/auth/constants/role.constant"
import type { LoginInput } from "@src/auth/dtos/auth-login-input.dto"
import type { AuthTokenOutput } from "@src/auth/dtos/auth-token-output.dto"
import { RequestContext } from "@src/shared/request-context/request-context.dto"
import type { CreateUserInput } from "@src/user/dtos/user-create-input.dto"
import type { UserOutput } from "@src/user/dtos/user-output.dto"
import { UserService } from "@src/user/services/user.service"

const DB_NAME = "my-nest-rest-starter-db-test"
const DB_HOST = "localhost"
const DB_PORT = 5455
const DB_USER = "root"
const DB_PASS = "rootroot"

const DB_CONNECTION_NAME = "e2e_test_connection"

const testDataSourceConfig = {
  database: DB_NAME,
  host: DB_HOST,
  name: DB_CONNECTION_NAME,
  password: DB_PASS,
  port: DB_PORT,
  username: DB_USER,
}

function log(s: string) {
  // set verbose to true if debugging of this part of the app is needed
  const verbose = false
  if (verbose) {
    console.debug(s)
  }
}

async function closeDBAfterTest(): Promise<void> {
  log(`Closing connection to "${DB_NAME}" database`)

  const dataSource = new DataSource({
    ...testDataSourceConfig,
    type: "postgres",
  })

  await dataSource.initialize()

  await dataSource.destroy()
}

async function createDBEntities(): Promise<void> {
  log(`Creating entities in "${DB_NAME}" database`)

  const dataSource = new DataSource({
    ...testDataSourceConfig,
    // Drops the schema (and consequently all tables) if it exists;
    dropSchema: true,
    entities: [__dirname + "/../src/**/*.entity{.ts,.js}"],
    // Auto apply all migrations even if they never existed
    migrationsRun: true,
    // Auto-create the schema if it does not exist. It always recreates because we always drop.
    synchronize: true,
    type: "postgres",
  })

  await dataSource.initialize()
}

async function resetDBBeforeTest(): Promise<void> {
  // This overwrites the DB_NAME used in the SharedModule's TypeORM init.
  // All the tests will run against the e2e db due to this overwrite.
  process.env.DB_NAME = DB_NAME
  process.env.DB_HOST = DB_HOST
  process.env.DB_PORT = DB_PORT.toString()
  process.env.DB_USER = DB_USER
  process.env.DB_PASS = DB_PASS

  log(`Dropping "${DB_NAME}" database and recreating it`)

  const dataSource = new DataSource({
    ...testDataSourceConfig,
    type: "postgres",
  })

  await dataSource.initialize()

  try {
    await dataSource.query(`drop database if exists "${DB_NAME}"`)
  } catch (e) {
    // log(`Database "${DB_NAME}" could not be dropped; Skipping.`);
  }

  try {
    await dataSource.query(`create database "${DB_NAME}"`)
  } catch (e) {
    // log(`Database "${DB_NAME}" already exists; Skipping.`);
  }

  await dataSource.destroy()
}

async function seedAdminUser(
  app: INestApplication,
): Promise<{ adminUser: UserOutput; authTokenForAdmin: AuthTokenOutput }> {
  const defaultAdmin: CreateUserInput = {
    email: "default-admin@example.com",
    isAccountDisabled: false,
    name: "Default Admin User",
    password: "default-admin-password",
    roles: [ROLE.ADMIN],
    username: "default-admin",
  }

  const ctx = new RequestContext()

  // Creating Admin User
  const userService = app.get(UserService)
  const userOutput = await userService.createUser(ctx, defaultAdmin)

  const loginInput: LoginInput = {
    password: defaultAdmin.password,
    username: defaultAdmin.username,
  }

  // Logging in Admin User to get AuthToken
  const loginResponse = await request(app.getHttpServer())
    .post("/auth/login")
    .send(loginInput)
    .expect(HttpStatus.OK)

  const authTokenForAdmin: AuthTokenOutput = loginResponse.body.data

  const adminUser: UserOutput = JSON.parse(JSON.stringify(userOutput))

  return { adminUser, authTokenForAdmin }
}

export {
  closeDBAfterTest,
  createDBEntities,
  DB_HOST,
  DB_NAME,
  DB_PASS,
  DB_PORT,
  DB_USER,
  resetDBBeforeTest,
  seedAdminUser,
}
