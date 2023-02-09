import type { ExecutionContext } from "@nestjs/common"
import { createParamDecorator } from "@nestjs/common"

import type { RequestContext } from "./request-context.dto"
import { createRequestContext } from "./util"

export const ReqContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext => {
    const request = ctx.switchToHttp().getRequest()

    return createRequestContext(request)
  },
)
