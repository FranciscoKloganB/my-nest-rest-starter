import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"

import { SharedModule } from "@shared/shared.module"
import { UserModule } from "@user/user.module"

import { STRATEGY_JWT_AUTH } from "./constants/strategy.constant"
import { AuthController } from "./controllers/auth.controller"
import { AuthService } from "./services/auth.service"
import { JwtAuthStrategy } from "./strategies/jwt-auth.strategy"
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy"
import { LocalStrategy } from "./strategies/local.strategy"

@Module({
  controllers: [AuthController],
  imports: [
    SharedModule,
    PassportModule.register({ defaultStrategy: STRATEGY_JWT_AUTH }),
    JwtModule.registerAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        privateKey: configService.get<string>("jwt.privateKey"),
        publicKey: configService.get<string>("jwt.publicKey"),
        signOptions: {
          algorithm: "RS256",
        },
      }),
    }),
    UserModule,
  ],
  providers: [AuthService, LocalStrategy, JwtAuthStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
