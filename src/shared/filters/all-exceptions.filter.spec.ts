import { HttpException, HttpStatus } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"
import { v4 as uuidv4 } from "uuid"

import { REQUEST_ID_TOKEN_HEADER } from "@shared/constants"
import { AppLogger } from "@shared/logger/logger.service"

import { AllExceptionsFilter } from "./all-exceptions.filter"

const mockMessage1 = "mock exception string"
const mockMessage2 = { hello: "world", hi: "joe" }
const mockMessage3 = "Something is very wrong"

const mockException1 = new HttpException(mockMessage1, HttpStatus.NOT_FOUND)
const mockException2 = new HttpException(mockMessage2, HttpStatus.BAD_REQUEST)
const mockError = new Error(mockMessage3)

describe("AllExceptionsFilter", () => {
  let mockContext: any
  let mockRequest: any
  let mockResponse: any

  const mockConfigService = {
    get: (_key) => "development",
  }
  const mockedLogger = {
    setContext: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
  }
  let filter: AllExceptionsFilter<any>

  beforeEach(async () => {
    /** mock request object */
    mockRequest = {
      header: jest.fn(),
      headers: {},
      url: "mock-url",
    }
    mockRequest.headers[REQUEST_ID_TOKEN_HEADER] = uuidv4()

    /** mock response object */
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    }

    /** mock execution context */
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile()

    // config = moduleRef.get<ConfigService>(ConfigService);
    filter = moduleRef.get<AllExceptionsFilter<any>>(AllExceptionsFilter)
  })

  it("should be defined", async () => {
    expect(filter).toBeDefined()
  })

  it("should handle both HttpException and unhandled Error", async () => {
    filter.catch(mockException1, mockContext)
    expect(mockResponse.status).toBeCalled()
    expect(mockResponse.json).toBeCalled()

    filter.catch(mockError, mockContext)
    expect(mockResponse.status).toBeCalled()
    expect(mockResponse.json).toBeCalled()
  })

  it("should handle HttpException with right status code", async () => {
    filter.catch(mockException1, mockContext)
    expect(mockResponse.status).toBeCalledWith(HttpStatus.NOT_FOUND)

    filter.catch(mockException2, mockContext)
    expect(mockResponse.status).toBeCalledWith(HttpStatus.BAD_REQUEST)
  })

  it("should handle unhandled error with status code 500", async () => {
    filter.catch(mockError, mockContext)
    expect(mockResponse.status).toBeCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
  })

  it("should handle exception with plain string message", async () => {
    filter.catch(mockException1, mockContext)
    expect(mockResponse.json).toBeCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: mockMessage1,
          statusCode: HttpStatus.NOT_FOUND,
        }),
      }),
    )
  })

  it("should handle exception with object type message", async () => {
    filter.catch(mockException2, mockContext)
    expect(mockResponse.json).toBeCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          details: mockMessage2,
          statusCode: HttpStatus.BAD_REQUEST,
        }),
      }),
    )
  })

  it("should respond with Error message in development mode", async () => {
    // const configSpy = jest
    //   .spyOn(config, 'get')
    //   .mockImplementation(() => 'development');

    filter.catch(mockError, mockContext)
    expect(mockResponse.json).toBeCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: mockMessage3,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      }),
    )

    // configSpy.mockClear();
  })

  it("should suppress Error message in production mode", async () => {
    const configSpy = jest
      .spyOn(mockConfigService, "get")
      .mockImplementation(() => "production")

    filter.catch(mockError, mockContext)
    expect(mockResponse.json).toBeCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "Internal server error",
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      }),
    )

    configSpy.mockClear()
  })

  it("should contain request id in response", async () => {
    filter.catch(mockMessage1, mockContext)
    expect(mockResponse.json).toBeCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          requestId: mockRequest.headers[REQUEST_ID_TOKEN_HEADER],
        }),
      }),
    )
  })

  it("should contain request path in response", async () => {
    filter.catch(mockMessage1, mockContext)
    expect(mockResponse.json).toBeCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          path: mockRequest.url,
        }),
      }),
    )
  })

  it("should contain timestamp in response", async () => {
    const mockDate = new Date()

    const dateSpy = jest.spyOn(global, "Date").mockImplementation(() => mockDate as any)

    filter.catch(mockException1, mockContext)
    expect(mockResponse.status).toBeCalledWith(HttpStatus.NOT_FOUND)
    expect(mockResponse.json).toBeCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          timestamp: mockDate.toISOString(),
        }),
      }),
    )
    dateSpy.mockClear()
  })
})
