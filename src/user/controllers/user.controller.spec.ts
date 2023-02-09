import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"

import { ROLE } from "@auth/constants/role.constant"
import type { PaginationParamsDto } from "@shared/dtos/pagination-params.dto"
import { AppLogger } from "@shared/logger/logger.service"
import { RequestContext } from "@shared/request-context/request-context.dto"
import type { UserOutput } from "@user/dtos/user-output.dto"
import { UpdateUserInput } from "@user/dtos/user-update-input.dto"
import { UserService } from "@user/services/user.service"

import { UserController } from "./user.controller"

describe("UserController", () => {
  let controller: UserController
  const mockedUserService = {
    getUserById: jest.fn(),
    getUsers: jest.fn(),
    updateUser: jest.fn(),
  }

  const mockedLogger = { log: jest.fn(), setContext: jest.fn() }

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockedUserService },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile()

    controller = moduleRef.get<UserController>(UserController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  const ctx = new RequestContext()

  describe("get Users as a list", () => {
    it("Calls getUsers function", () => {
      const query: PaginationParamsDto = {
        limit: 0,
        offset: 0,
      }
      mockedUserService.getUsers.mockResolvedValue({ count: 0, users: [] })
      controller.getUsers(ctx, query)
      expect(mockedUserService.getUsers).toHaveBeenCalled()
    })
  })

  const currentDate = new Date().toString()

  const expectedOutput: UserOutput = {
    createdAt: currentDate,
    email: "e2etester@random.com",
    id: 1,
    isAccountDisabled: false,
    name: "default-name",
    roles: [ROLE.USER],
    updatedAt: currentDate,
    username: "default-user",
  }

  describe("Get user by id", () => {
    it("should call service method getUserById with id", async () => {
      const id = 1
      mockedUserService.getUserById.mockResolvedValue(expectedOutput)

      expect(await controller.getUser(ctx, id)).toEqual({
        data: expectedOutput,
        meta: {},
      })
      expect(mockedUserService.getUserById).toHaveBeenCalledWith(ctx, id)
    })
  })

  describe("Update user by id", () => {
    it("Update user by id and returns user", async () => {
      const input = new UpdateUserInput()
      mockedUserService.updateUser.mockResolvedValue(expectedOutput)

      expect(await controller.updateUser(ctx, 1, input)).toEqual({
        data: expectedOutput,
        meta: {},
      })
    })
  })
})
