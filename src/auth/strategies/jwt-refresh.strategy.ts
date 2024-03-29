import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

import { STRATEGY_JWT_REFRESH } from "@auth/constants/strategy.constant"
import type { UserRefreshTokenClaims } from "@auth/dtos/auth-token-output.dto"

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_JWT_REFRESH,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      algorithms: ["RS256"],
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      secretOrKey: configService.get<string>("jwt.publicKey"),
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async validate(payload: any): Promise<UserRefreshTokenClaims> {
    // Passport automatically creates a user object, based on the value we return from the validate() method,
    // and assigns it to the Request object as req.user
    return { id: payload.sub }
  }
}
