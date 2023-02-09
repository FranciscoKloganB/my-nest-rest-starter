import { UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"

import { ROLE } from "@auth/constants/role.constant"
import type {
  AuthTokenOutput,
  UserAccessTokenClaims,
} from "@auth/dtos/auth-token-output.dto"
import { AppLogger } from "@shared/logger/logger.service"
import { RequestContext } from "@shared/request-context/request-context.dto"
import type { UserOutput } from "@user/dtos/user-output.dto"
import { UserService } from "@user/services/user.service"

import { AuthService } from "./auth.service"

describe("AuthService", () => {
  let service: AuthService

  const accessTokenClaims: UserAccessTokenClaims = {
    id: 6,
    roles: [ROLE.USER],
    username: "jhon",
  }

  const registerInput = {
    email: "randomUser@random.com",
    isAccountDisabled: false,
    name: "Jhon doe",
    password: "any password",
    roles: [ROLE.USER],
    username: "jhon",
  }

  const currentDate = new Date().toString()

  const userOutput: UserOutput = {
    createdAt: currentDate,
    email: "randomUser@random.com",
    isAccountDisabled: false,
    name: "Jhon doe",
    roles: [ROLE.USER],
    updatedAt: currentDate,
    username: "jhon",
    ...accessTokenClaims,
  }

  const authToken: AuthTokenOutput = {
    accessToken: "random_access_token",
    refreshToken: "random_refresh_token",
  }

  const mockedUserService = {
    createUser: jest.fn(),
    findById: jest.fn(),
    validateUsernamePassword: jest.fn(),
  }

  const mockedJwtService = {
    sign: jest.fn(),
  }

  const mockedConfigService = { get: jest.fn() }

  const mockedLogger = { log: jest.fn(), setContext: jest.fn() }

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockedUserService },
        { provide: JwtService, useValue: mockedJwtService },
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile()

    service = moduleRef.get<AuthService>(AuthService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  const ctx = new RequestContext()

  describe("validateUser", () => {
    it("should success when username/password valid", async () => {
      jest
        .spyOn(mockedUserService, "validateUsernamePassword")
        .mockImplementation(() => userOutput)

      expect(await service.validateUser(ctx, "jhon", "somepass")).toEqual(userOutput)
      expect(mockedUserService.validateUsernamePassword).toBeCalledWith(
        ctx,
        "jhon",
        "somepass",
      )
    })

    it("should fail when username/password invalid", async () => {
      jest
        .spyOn(mockedUserService, "validateUsernamePassword")
        .mockImplementation(() => {
          throw new UnauthorizedException()
        })

      await expect(service.validateUser(ctx, "jhon", "somepass")).rejects.toThrowError(
        UnauthorizedException,
      )
    })

    it("should fail when user account is disabled", async () => {
      jest
        .spyOn(mockedUserService, "validateUsernamePassword")
        .mockImplementation(() => ({ ...userOutput, isAccountDisabled: true }))

      await expect(service.validateUser(ctx, "jhon", "somepass")).rejects.toThrowError(
        UnauthorizedException,
      )
    })
  })

  describe("login", () => {
    it("should return auth token for valid user", async () => {
      jest.spyOn(service, "getAuthToken").mockImplementation(() => authToken)

      const result = service.login(ctx)

      expect(service.getAuthToken).toBeCalledWith(ctx, accessTokenClaims)
      expect(result).toEqual(authToken)
    })
  })

  describe("register", () => {
    it("should register new user", async () => {
      jest.spyOn(mockedUserService, "createUser").mockImplementation(() => userOutput)

      const result = await service.register(ctx, registerInput)

      expect(mockedUserService.createUser).toBeCalledWith(ctx, registerInput)
      expect(result).toEqual(userOutput)
    })
  })

  describe("refreshToken", () => {
    ctx.user = accessTokenClaims

    it("should generate auth token", async () => {
      jest
        .spyOn(mockedUserService, "findById")
        .mockImplementation(async () => userOutput)

      jest.spyOn(service, "getAuthToken").mockImplementation(() => authToken)

      const result = await service.refreshToken(ctx)

      expect(service.getAuthToken).toBeCalledWith(ctx, userOutput)
      expect(result).toMatchObject(authToken)
    })

    it("should throw exception when user is not valid", async () => {
      jest.spyOn(mockedUserService, "findById").mockImplementation(async () => null)

      await expect(service.refreshToken(ctx)).rejects.toThrowError("Invalid user id")
    })

    afterEach(() => {
      jest.resetAllMocks()
    })
  })

  describe("getAuthToken", () => {
    const accessTokenExpiry = 100
    const refreshTokenExpiry = 200
    const user = { id: 5, roles: [ROLE.USER], username: "username" }

    const subject = { sub: user.id }
    const payload = {
      roles: [ROLE.USER],
      sub: user.id,
      username: user.username,
    }

    beforeEach(() => {
      jest.spyOn(mockedConfigService, "get").mockImplementation((key) => {
        let value = null
        switch (key) {
          case "jwt.accessTokenExpiresInSec":
            value = accessTokenExpiry
            break
          case "jwt.refreshTokenExpiresInSec":
            value = refreshTokenExpiry
            break
        }

        return value
      })

      jest.spyOn(mockedJwtService, "sign").mockImplementation(() => "signed-response")
    })

    it("should generate access token with payload", () => {
      const result = service.getAuthToken(ctx, user)

      expect(mockedJwtService.sign).toBeCalledWith(
        { ...payload, ...subject },
        { expiresIn: accessTokenExpiry },
      )

      expect(result).toMatchObject({
        accessToken: "signed-response",
      })
    })

    it("should generate refresh token with subject", () => {
      const result = service.getAuthToken(ctx, user)

      expect(mockedJwtService.sign).toBeCalledWith(subject, {
        expiresIn: refreshTokenExpiry,
      })

      expect(result).toMatchObject({
        refreshToken: "signed-response",
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })
  })
})
