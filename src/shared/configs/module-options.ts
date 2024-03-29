import type { ConfigModuleOptions } from "@nestjs/config"
import { z } from "zod"

import configuration from "./configuration"

const environments = ["development", "test", "staging", "production"] as const
const environmentBooleans = ["true", "false", "0", "1"] as const

const configModuleValidator = z.object({
  APP_ENV: z.enum(environments).default("development"),
  APP_PORT: z.preprocess((val) => Number(val), z.number()),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASS: z.string(),
  DB_PORT: z.preprocess((val) => Number(val), z.number()),
  DB_USER: z.string(),
  DEFAULT_ADMIN_USER_PASSWORD: z.string(),
  JWT_ACCESS_TOKEN_EXP_IN_SEC: z.string(),
  JWT_PRIVATE_KEY_BASE64: z.string(),
  JWT_PUBLIC_KEY_BASE64: z.string(),
  JWT_REFRESH_TOKEN_EXP_IN_SEC: z.string(),
  LOG_SILENT: z.enum(environmentBooleans).default("false"),
})

export const configModuleOptions: ConfigModuleOptions = {
  envFilePath: ".env",
  load: [configuration],
  validationSchema: {
    validate: () => configModuleValidator.parse(process.env),
  },
}
