export default (): any => ({
  database: {
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    pass: process.env.DB_PASS,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    user: process.env.DB_USER,
  },
  defaultAdminUserPassword: process.env.DEFAULT_ADMIN_USER_PASSWORD,
  env: process.env.APP_ENV,
  jwt: {
    accessTokenExpiresInSec: parseInt(process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC, 10),
    privateKey: Buffer.from(process.env.JWT_PRIVATE_KEY_BASE64, "base64").toString(
      "utf8",
    ),
    publicKey: Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64, "base64").toString(
      "utf8",
    ),
    refreshTokenExpiresInSec: parseInt(process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC, 10),
  },
  logging: {
    silent: process.env.LOG_SILENT === "true" || process.env.LOG_SILENT === "1",
  },
  port: process.env.APP_PORT,
})
