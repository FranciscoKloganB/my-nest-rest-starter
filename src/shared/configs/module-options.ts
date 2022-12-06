import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { z } from 'zod';

import configuration from './configuration';

const environments = ['development', 'test', 'staging', 'production'] as const;
const environmentBooleans = ['true', 'false', '0', '1'] as const;

export const configModuleOptions: ConfigModuleOptions = {
  envFilePath: '.env',
  load: [configuration],
  validationSchema: z.object({
    APP_ENV: z.enum(environments).default('development'),
    APP_PORT: z.number(),
    DB_HOST: z.string(),
    DB_PORT: z.number().optional(),
    DB_NAME: z.string(),
    DB_USER: z.string(),
    DB_PASS: z.string(),
    DEFAULT_ADMIN_USER_PASSWORD: z.string(),
    JWT_PUBLIC_KEY_BASE64: z.string(),
    JWT_PRIVATE_KEY_BASE64: z.string(),
    JWT_ACCESS_TOKEN_EXP_IN_SEC: z.number(),
    JWT_REFRESH_TOKEN_EXP_IN_SEC: z.number(),
    LOG_SILENT: z.enum(environmentBooleans).default('false'),
  }),
};
