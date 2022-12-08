import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { ROLE } from '../src/auth/constants/role.constant';
import { LoginInput } from '../src/auth/dtos/auth-login-input.dto';
import { AuthTokenOutput } from '../src/auth/dtos/auth-token-output.dto';
import { RequestContext } from '../src/shared/request-context/request-context.dto';
import { CreateUserInput } from '../src/user/dtos/user-create-input.dto';
import { UserOutput } from '../src/user/dtos/user-output.dto';
import { UserService } from '../src/user/services/user.service';

export const TEST_DB_NAME = process.env.TEST_DB_NAME ?? 'my-nest-rest-starter-db-e2e';
export const TEST_DB_HOST = process.env.TEST_DB_HOST ?? 'localhost';
export const TEST_DB_PORT = +(process.env.TEST_DB_PORT ?? '5433');
export const TEST_DB_USER = process.env.TEST_DB_USER ?? 'e2euser';
export const TEST_DB_PASS = process.env.TEST_DB_PASS ?? 'e2epwd';

const TEST_DB_CONNECTION_NAME = 'e2e_test_connection';

const testDataSourceConfig = {
  name: TEST_DB_CONNECTION_NAME,
  host: TEST_DB_HOST,
  port: TEST_DB_PORT,
  database: TEST_DB_NAME,
  username: TEST_DB_USER,
  password: TEST_DB_PASS,
};

const log = (s: string) => {
  // set verbose to true if debugging of this part of the app is needed
  const verbose = false;
  if (verbose) {
    console.debug(s);
  }
};

export const resetDBBeforeTest = async (): Promise<void> => {
  // This overwrites the DB_NAME used in the SharedModule's TypeORM init.
  // All the tests will run against the e2e db due to this overwrite.
  process.env.DB_NAME = TEST_DB_NAME;
  process.env.DB_HOST = TEST_DB_HOST;
  process.env.DB_PORT = TEST_DB_PORT.toString();
  process.env.DB_USER = TEST_DB_USER;
  process.env.DB_PASS = TEST_DB_PASS;

  log(`Dropping "${TEST_DB_NAME}" database and recreating it`);

  const dataSource = new DataSource({
    ...testDataSourceConfig,
    type: 'postgres',
  });

  await dataSource.initialize();

  try {
    await dataSource.query(`drop database if exists "${TEST_DB_NAME}"`);
  } catch (e) {
    // log(`Database "${TEST_DB_NAME}" could not be dropped; Skipping.`);
  }

  try {
    await dataSource.query(`create database "${TEST_DB_NAME}"`);
  } catch (e) {
    // log(`Database "${TEST_DB_NAME}" already exists; Skipping.`);
  }

  await dataSource.destroy();
};

export const createDBEntities = async (): Promise<void> => {
  log(`Creating entities in "${TEST_DB_NAME}" database`);

  const dataSource = new DataSource({
    ...testDataSourceConfig,
    // Drops the schema (and consequently all tables) if it exists;
    dropSchema: true,
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    // Auto apply all migrations even if they never existed
    migrationsRun: true,
    // Auto-create the schema if it does not exist. It always recreates because we always drop.
    synchronize: true,
    type: 'postgres',
  });

  await dataSource.initialize();
};

export const seedAdminUser = async (
  app: INestApplication
): Promise<{ adminUser: UserOutput; authTokenForAdmin: AuthTokenOutput }> => {
  const defaultAdmin: CreateUserInput = {
    name: 'Default Admin User',
    username: 'default-admin',
    password: 'default-admin-password',
    roles: [ROLE.ADMIN],
    isAccountDisabled: false,
    email: 'default-admin@example.com',
  };

  const ctx = new RequestContext();

  // Creating Admin User
  const userService = app.get(UserService);
  const userOutput = await userService.createUser(ctx, defaultAdmin);

  const loginInput: LoginInput = {
    username: defaultAdmin.username,
    password: defaultAdmin.password,
  };

  // Logging in Admin User to get AuthToken
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send(loginInput)
    .expect(HttpStatus.OK);

  const authTokenForAdmin: AuthTokenOutput = loginResponse.body.data;

  const adminUser: UserOutput = JSON.parse(JSON.stringify(userOutput));

  return { adminUser, authTokenForAdmin };
};

export const closeDBAfterTest = async (): Promise<void> => {
  log(`Closing connection to "${TEST_DB_NAME}" database`);

  const dataSource = new DataSource({
    ...testDataSourceConfig,
    type: 'postgres',
  });

  await dataSource.initialize();

  await dataSource.destroy();
};
