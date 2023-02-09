import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common"
import { Injectable } from "@nestjs/common"
import type { Observable } from "rxjs"
import { tap } from "rxjs/operators"

import { AppLogger } from "@shared/logger/logger.service"
import { createRequestContext } from "@shared/request-context/util"

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private appLogger: AppLogger) {
    this.appLogger.setContext(LoggingInterceptor.name)
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const method = request.method
    const ctx = createRequestContext(request)

    const now = Date.now()

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse()
        const statusCode = response.statusCode

        const responseTime = Date.now() - now

        const resData = { method, responseTime, statusCode }

        this.appLogger.log(ctx, "Request completed", { resData })
      }),
    )
  }
}
