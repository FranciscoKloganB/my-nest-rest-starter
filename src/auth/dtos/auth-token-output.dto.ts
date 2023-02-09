import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"

import type { ROLE } from "@auth/constants/role.constant"

class AuthTokenOutput {
  @Expose()
  @ApiProperty()
  accessToken: string

  @Expose()
  @ApiProperty()
  refreshToken: string
}

class UserAccessTokenClaims {
  @Expose()
  id: number
  @Expose()
  username: string
  @Expose()
  roles: ROLE[]
}

class UserRefreshTokenClaims {
  id: number
}

export { AuthTokenOutput, UserAccessTokenClaims, UserRefreshTokenClaims }
