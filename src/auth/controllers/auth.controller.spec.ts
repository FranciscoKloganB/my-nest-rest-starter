import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"

import { LoginInput } from "@auth/dtos/auth-login-input.dto"
import type { RefreshTokenInput } from "@auth/dtos/auth-refresh-token-input.dto"
import { RegisterInput } from "@auth/dtos/auth-register-input.dto"
import type { AuthTokenOutput } from "@auth/dtos/auth-token-output.dto"
import { AuthService } from "@auth/services/auth.service"
import { AppLogger } from "@shared/logger/logger.service"
import { RequestContext } from "@shared/request-context/request-context.dto"

import { AuthController } from "./auth.controller"

describe("AuthController", () => {
  let moduleRef: TestingModule
  let authController: AuthController

  const mockedAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    register: jest.fn(),
  }

  const mockedLogger = { log: jest.fn(), setContext: jest.fn() }

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockedAuthService },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile()

    authController = moduleRef.get<AuthController>(AuthController)
  })

  it("should be defined", () => {
    expect(authController).toBeDefined()
  })

  const ctx = new RequestContext()

  describe("registerLocal", () => {
    it("should register new user", async () => {
      const registerInputDto = new RegisterInput()
      registerInputDto.name = "John Doe"
      registerInputDto.username = "john@example.com"
      registerInputDto.password = "123123"

      jest.spyOn(mockedAuthService, "register").mockImplementation(async () => null)

      expect(await authController.registerLocal(ctx, registerInputDto)).toEqual({
        data: null,
        meta: {},
      })
    })
  })

  describe("login", () => {
    it("should login user", async () => {
      const loginInputDto = new LoginInput()
      loginInputDto.username = "john@example.com"
      loginInputDto.password = "123123"

      jest.spyOn(mockedAuthService, "login").mockImplementation(() => null)

      expect(await authController.login(ctx, loginInputDto)).toEqual({
        data: null,
        meta: {},
      })
    })
  })

  describe("refreshToken", () => {
    let refreshTokenInputDto: RefreshTokenInput
    let authToken: AuthTokenOutput

    beforeEach(() => {
      refreshTokenInputDto = {
        refreshToken: "refresh_token",
      }
      authToken = {
        accessToken: "new_access_token",
        refreshToken: "new_refresh_token",
      }

      jest
        .spyOn(mockedAuthService, "refreshToken")
        .mockImplementation(async () => authToken)
    })

    it("should generate refresh token", async () => {
      const response = await authController.refreshToken(ctx, refreshTokenInputDto)

      expect(mockedAuthService.refreshToken).toBeCalledWith(ctx)
      expect(response.data).toEqual(authToken)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })
  })
})
