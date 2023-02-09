import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"

import { ROLE } from "@auth/constants/role.constant"
import { RequestContext } from "@shared/request-context/request-context.dto"
import type { CreateUserInput } from "@user/dtos/user-create-input.dto"
import { UserService } from "@user/services/user.service"

import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)

  const configService = app.get(ConfigService)
  const defaultAdminUserPassword = configService.get<string>("defaultAdminUserPassword")

  const userService = app.get(UserService)

  const defaultAdmin: CreateUserInput = {
    email: "default-admin@example.com",
    isAccountDisabled: false,
    name: "Default Admin User",
    password: defaultAdminUserPassword,
    roles: [ROLE.ADMIN],
    username: "default-admin",
  }

  const ctx = new RequestContext()

  // Create the default admin user if it doesn't already exist.
  const user = await userService.findByUsername(ctx, defaultAdmin.username)
  if (!user) {
    await userService.createUser(ctx, defaultAdmin)
  }

  await app.close()
}
bootstrap()
