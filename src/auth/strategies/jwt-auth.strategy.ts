import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

import { STRATEGY_JWT_AUTH } from "@auth/constants/strategy.constant"
import type { UserAccessTokenClaims } from "@auth/dtos/auth-token-output.dto"

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, STRATEGY_JWT_AUTH) {
  constructor(private readonly configService: ConfigService) {
    super({
      algorithms: ["RS256"],
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("jwt.publicKey"),
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async validate(payload: any): Promise<UserAccessTokenClaims> {
    // Passport automatically creates a user object, based on the value we return from the validate() method,
    // and assigns it to the Request object as req.user
    return {
      id: payload.sub,
      roles: payload.roles,
      username: payload.username,
    }
  }
}
