import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { plainToClass } from "class-transformer"

import { ROLE } from "@auth/constants/role.constant"
import type { RegisterInput } from "@auth/dtos/auth-register-input.dto"
import { RegisterOutput } from "@auth/dtos/auth-register-output.dto"
import type { UserAccessTokenClaims } from "@auth/dtos/auth-token-output.dto"
import { AuthTokenOutput } from "@auth/dtos/auth-token-output.dto"
import { AppLogger } from "@shared/logger/logger.service"
import type { RequestContext } from "@shared/request-context/request-context.dto"
import type { UserOutput } from "@user/dtos/user-output.dto"
import { UserService } from "@user/services/user.service"

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name)
  }

  async validateUser(
    ctx: RequestContext,
    username: string,
    pass: string,
  ): Promise<UserAccessTokenClaims> {
    this.logger.log(ctx, `${this.validateUser.name} was called`)

    // The userService will throw Unauthorized in case of invalid username/password.
    const user = await this.userService.validateUsernamePassword(ctx, username, pass)

    // Prevent disabled users from logging in.
    if (user.isAccountDisabled) {
      throw new UnauthorizedException("This user account has been disabled")
    }

    return user
  }

  login(ctx: RequestContext): AuthTokenOutput {
    this.logger.log(ctx, `${this.login.name} was called`)

    return this.getAuthToken(ctx, ctx.user)
  }

  async register(ctx: RequestContext, input: RegisterInput): Promise<RegisterOutput> {
    this.logger.log(ctx, `${this.register.name} was called`)

    /**
     * TODO: Setting default role as USER here
     *  Should add option to change this later via ADMIN users.
     */
    input.roles = [ROLE.USER]
    input.isAccountDisabled = false

    const registeredUser = await this.userService.createUser(ctx, input)

    return plainToClass(RegisterOutput, registeredUser, {
      excludeExtraneousValues: true,
    })
  }

  async refreshToken(ctx: RequestContext): Promise<AuthTokenOutput> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`)

    const user = await this.userService.findById(ctx, ctx.user.id)
    if (!user) {
      throw new UnauthorizedException("Invalid user id")
    }

    return this.getAuthToken(ctx, user)
  }

  getAuthToken(
    ctx: RequestContext,
    user: UserAccessTokenClaims | UserOutput,
  ): AuthTokenOutput {
    this.logger.log(ctx, `${this.getAuthToken.name} was called`)

    const subject = { sub: user.id }
    const payload = {
      roles: user.roles,
      sub: user.id,
      username: user.username,
    }

    const authToken = {
      accessToken: this.jwtService.sign(
        { ...payload, ...subject },
        { expiresIn: this.configService.get("jwt.accessTokenExpiresInSec") },
      ),
      refreshToken: this.jwtService.sign(subject, {
        expiresIn: this.configService.get("jwt.refreshTokenExpiresInSec"),
      }),
    }

    return plainToClass(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true,
    })
  }
}
