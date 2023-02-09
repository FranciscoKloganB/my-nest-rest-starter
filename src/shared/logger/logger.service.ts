import { Injectable, Scope } from "@nestjs/common"
import type { Logger } from "winston"
import { createLogger, transports } from "winston"

import type { RequestContext } from "@shared/request-context/request-context.dto"

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger {
  private context?: string
  private logger: Logger

  public setContext(context: string): void {
    this.context = context
  }

  constructor() {
    this.logger = createLogger({
      transports: [
        new transports.Console({
          silent: process.env.LOG_SILENT === "true" || process.env.LOG_SILENT === "1",
        }),
      ],
    })
  }

  error(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString()

    return this.logger.error({
      contextName: this.context,
      ctx,
      message,
      timestamp,
      ...meta,
    })
  }

  warn(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString()

    return this.logger.warn({
      contextName: this.context,
      ctx,
      message,
      timestamp,
      ...meta,
    })
  }

  debug(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString()

    return this.logger.debug({
      contextName: this.context,
      ctx,
      message,
      timestamp,
      ...meta,
    })
  }

  verbose(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString()

    return this.logger.verbose({
      contextName: this.context,
      ctx,
      message,
      timestamp,
      ...meta,
    })
  }

  log(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString()

    return this.logger.info({
      contextName: this.context,
      ctx,
      message,
      timestamp,
      ...meta,
    })
  }
}
