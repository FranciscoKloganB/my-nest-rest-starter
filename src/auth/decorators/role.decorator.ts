import type { CustomDecorator } from "@nestjs/common"
import { SetMetadata } from "@nestjs/common"

import type { ROLE } from "@auth/constants/role.constant"

const ROLES_KEY = "roles"
const Roles = (...roles: ROLE[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles)

export { Roles, ROLES_KEY }
