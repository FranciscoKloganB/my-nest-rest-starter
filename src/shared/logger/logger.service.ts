import { Injectable, Scope } from '@nestjs/common';
import { createLogger, Logger, transports } from 'winston';

import { RequestContext } from '@shared/request-context/request-context.dto';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger {
  private context?: string;
  private logger: Logger;

  public setContext(context: string): void {
    this.context = context;
  }

  constructor() {
    this.logger = createLogger({
      transports: [
        new transports.Console({
          silent: process.env.LOG_SILENT === 'true' || process.env.LOG_SILENT === '1',
        }),
      ],
    });
  }

  error(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString();

    return this.logger.error({
      message,
      contextName: this.context,
      ctx,
      timestamp,
      ...meta,
    });
  }

  warn(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString();

    return this.logger.warn({
      message,
      contextName: this.context,
      ctx,
      timestamp,
      ...meta,
    });
  }

  debug(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString();

    return this.logger.debug({
      message,
      contextName: this.context,
      ctx,
      timestamp,
      ...meta,
    });
  }

  verbose(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString();

    return this.logger.verbose({
      message,
      contextName: this.context,
      ctx,
      timestamp,
      ...meta,
    });
  }

  log(ctx: RequestContext, message: string, meta?: Record<string, any>): Logger {
    const timestamp = new Date().toISOString();

    return this.logger.info({
      message,
      contextName: this.context,
      ctx,
      timestamp,
      ...meta,
    });
  }
}
