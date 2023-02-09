import { HttpException } from "@nestjs/common"

export class BaseApiException extends HttpException {
  public localizedMessage: Record<string, string>
  public details: Record<string, any> | string

  constructor(
    message: string,
    status: number,
    details?: Record<string, any> | string,
    localizedMessage?: Record<string, string>,
  ) {
    // Calling parent constructor of base Exception class.
    super(message, status)
    this.name = BaseApiException.name
    this.localizedMessage = localizedMessage
    this.details = details
  }
}
