import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common"
import { Catch, HttpException, HttpStatus } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import type { Request, Response } from "express"

import { REQUEST_ID_TOKEN_HEADER } from "@shared/constants"
import { BaseApiException } from "@shared/exceptions/base-api.exception"
import { AppLogger } from "@shared/logger/logger.service"
import { createRequestContext } from "@shared/request-context/util"

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  /** set logger context */
  constructor(private config: ConfigService, private readonly logger: AppLogger) {
    this.logger.setContext(AllExceptionsFilter.name)
  }

  catch(exception: T, host: ArgumentsHost): any {
    const ctx = host.switchToHttp()
    const req: Request = ctx.getRequest<Request>()
    const res: Response = ctx.getResponse<Response>()

    const path = req.url
    const timestamp = new Date().toISOString()
    const requestId = req.headers[REQUEST_ID_TOKEN_HEADER]
    const requestContext = createRequestContext(req)

    let stack: any
    let statusCode: HttpStatus
    let errorName: string
    let message: string
    let details: Record<string, any> | string
    // TODO : Based on language value in header, return a localized message.
    const acceptedLanguage = "ja"
    let localizedMessage: string

    // TODO : Refactor the below cases into a switch case and tidy up error response creation.
    if (exception instanceof BaseApiException) {
      statusCode = exception.getStatus()
      errorName = exception.constructor.name
      message = exception.message
      localizedMessage = exception.localizedMessage[acceptedLanguage]
      details = exception.details || exception.getResponse()
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      errorName = exception.constructor.name
      message = exception.message
      details = exception.getResponse()
    } else if (exception instanceof Error) {
      errorName = exception.constructor.name
      message = exception.message
      stack = exception.stack
    }

    // Set to internal server error in case it did not match above categories.
    statusCode = statusCode || HttpStatus.INTERNAL_SERVER_ERROR
    errorName = errorName || "InternalException"
    message = message || "Internal server error"

    // NOTE: For reference, please check https://cloud.google.com/apis/design/errors
    const error = {
      details,
      errorName,
      localizedMessage,
      message,
      // Additional meta added by us.
      path,

      requestId,
      statusCode,
      timestamp,
    }
    this.logger.warn(requestContext, error.message, {
      error,
      stack,
    })

    // Suppress original internal server error details in prod mode
    const isProdMode = this.config.get<string>("env") !== "development"

    if (isProdMode && statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      error.message = "Internal server error"
    }

    res.status(statusCode).json({ error })
  }
}
