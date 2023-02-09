import * as dotenv from "dotenv"
import { DataSource } from "typeorm"

dotenv.config()

const typeOrmConfig = new DataSource({
  database: process.env.DB_NAME,
  entities: [__dirname + "/src/**/entities/*.entity{.ts,.js}"],
  host: process.env.DB_HOST,
  migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
  migrationsRun: false,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : null,
  schema: "public",
  synchronize: false,
  type: "postgres",
  username: process.env.DB_USER,
})

export default typeOrmConfig
