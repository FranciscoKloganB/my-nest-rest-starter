import { NotFoundException } from "@nestjs/common"
import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"
import * as bcrypt from "bcrypt"

import { ROLE } from "@auth/constants/role.constant"
import { AppLogger } from "@shared/logger/logger.service"
import { RequestContext } from "@shared/request-context/request-context.dto"
import type { UpdateUserInput } from "@user/dtos/user-update-input.dto"
import type { User } from "@user/entities/user.entity"
import { UserRepository } from "@user/repositories/user.repository"

import { UserService } from "./user.service"

describe("UserService", () => {
  let service: UserService

  const mockedRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    getById: jest.fn(),
    save: jest.fn(),
  }

  const user = {
    id: 6,
    name: "Jhon doe",
    roles: [ROLE.USER],
    username: "jhon",
  }

  const mockedLogger = { log: jest.fn(), setContext: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockedRepository,
        },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile()

    service = moduleRef.get<UserService>(UserService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  const ctx = new RequestContext()

  describe("createUser", () => {
    beforeEach(() => {
      jest.spyOn(bcrypt, "hash").mockImplementation(async () => "hashed-password")

      jest
        .spyOn(mockedRepository, "save")
        .mockImplementation(async (input) => ({ id: 6, ...input }))
    })

    it("should encrypt password before saving", async () => {
      const userInput = {
        email: "randomUser@random.com",
        isAccountDisabled: false,
        name: user.name,
        password: "plain-password",
        roles: [ROLE.USER],
        username: user.username,
      }

      await service.createUser(ctx, userInput)
      expect(bcrypt.hash).toBeCalledWith(userInput.password, 10)
    })

    it("should save user with encrypted password", async () => {
      const userInput = {
        email: "randomUser@random.com",
        isAccountDisabled: false,
        name: user.name,
        password: "plain-password",
        roles: [ROLE.USER],
        username: user.username,
      }

      await service.createUser(ctx, userInput)

      expect(mockedRepository.save).toBeCalledWith({
        email: "randomUser@random.com",
        isAccountDisabled: false,
        name: user.name,
        password: "hashed-password",
        roles: [ROLE.USER],
        username: user.username,
      })
    })

    it("should return serialized user", async () => {
      jest.spyOn(mockedRepository, "save").mockImplementation(async (input) => {
        input.id = 6

        return input
      })

      const userInput = {
        email: "randomUser@random.com",
        isAccountDisabled: false,
        name: user.name,
        password: "plain-password",
        roles: [ROLE.USER],
        username: user.username,
      }

      const result = await service.createUser(ctx, userInput)

      expect(result).toEqual({
        email: "randomUser@random.com",
        id: user.id,
        isAccountDisabled: false,
        name: userInput.name,
        roles: [ROLE.USER],
        username: userInput.username,
      })
      expect(result).not.toHaveProperty("password")
    })

    afterEach(() => {
      jest.resetAllMocks()
    })
  })

  describe("findById", () => {
    beforeEach(() => {
      jest.spyOn(mockedRepository, "findOne").mockImplementation(async () => user)
    })

    it("should find user from DB using given id", async () => {
      await service.findById(ctx, user.id)
      expect(mockedRepository.findOne).toBeCalledWith({
        where: { id: user.id },
      })
    })

    it("should return serialized user", async () => {
      const result = await service.findById(ctx, user.id)

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        roles: [ROLE.USER],
        username: user.username,
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })
  })

  describe("getUserById", () => {
    beforeEach(() => {
      jest.spyOn(mockedRepository, "getById").mockImplementation(async () => user)
    })

    it("should find user from DB using given id", async () => {
      await service.getUserById(ctx, user.id)
      expect(mockedRepository.getById).toBeCalledWith(user.id)
    })

    it("should return serialized user", async () => {
      const result = await service.getUserById(ctx, user.id)

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        roles: [ROLE.USER],
        username: user.username,
      })
    })

    it("throw not found exception if user is not found", async () => {
      mockedRepository.getById.mockRejectedValue(new NotFoundException())
      try {
        await service.getUserById(ctx, 100)
      } catch (error) {
        expect(error.constructor).toBe(NotFoundException)
      }
    })

    afterEach(() => {
      jest.resetAllMocks()
    })
  })

  describe("validateUsernamePassword", () => {
    it("should fail when username is invalid", async () => {
      jest.spyOn(mockedRepository, "findOne").mockImplementation(async () => null)

      await expect(
        service.validateUsernamePassword(ctx, "jhon", "password"),
      ).rejects.toThrowError()
    })

    it("should fail when password is invalid", async () => {
      jest.spyOn(mockedRepository, "findOne").mockImplementation(async () => user)

      jest.spyOn(bcrypt, "compare").mockImplementation(async () => false)

      await expect(
        service.validateUsernamePassword(ctx, "jhon", "password"),
      ).rejects.toThrowError()
    })

    it("should return  user  when credentials are valid", async () => {
      jest.spyOn(mockedRepository, "findOne").mockImplementation(async () => user)

      jest.spyOn(bcrypt, "compare").mockImplementation(async () => true)

      const result = await service.validateUsernamePassword(ctx, "jhon", "password")

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        roles: [ROLE.USER],
        username: user.username,
      })
    })
  })

  describe("getUsers", () => {
    it("gets users as a list", async () => {
      const offset = 0
      const limit = 0
      mockedRepository.findAndCount.mockResolvedValue([[user], 1])
      await service.getUsers(ctx, limit, offset)
      expect(mockedRepository.findAndCount).toHaveBeenCalled()
    })
  })

  describe("findByUsername", () => {
    beforeEach(() => {
      jest.spyOn(mockedRepository, "findOne").mockImplementation(async () => user)
    })

    it("should find user from DB using given username", async () => {
      await service.findByUsername(ctx, user.username)
      expect(mockedRepository.findOne).toBeCalledWith({
        where: {
          username: user.username,
        },
      })
    })

    it("should return serialized user", async () => {
      const result = await service.findByUsername(ctx, user.username)

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        roles: [ROLE.USER],
        username: user.username,
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })
  })

  describe("updateUser", () => {
    it("should call repository.save with correct input", async () => {
      const userId = 1
      const input: UpdateUserInput = {
        name: "Test",
        password: "updated-password",
      }

      const currentDate = new Date()

      const foundUser: User = {
        articles: [],
        createdAt: currentDate,
        email: "randomUser@random.com",
        id: userId,
        isAccountDisabled: false,
        name: "Default User",
        password: "random-password",
        roles: [ROLE.USER],
        updatedAt: currentDate,
        username: "default-user",
      }

      mockedRepository.getById.mockResolvedValue(foundUser)

      const expected: User = {
        articles: [],
        createdAt: currentDate,
        email: "randomUser@random.com",
        id: 1,
        isAccountDisabled: false,
        name: input.name,
        password: input.password,
        roles: [ROLE.USER],
        updatedAt: currentDate,
        username: "default-user",
      }

      jest.spyOn(bcrypt, "hash").mockImplementation(async () => "updated-password")

      await service.updateUser(ctx, userId, input)
      expect(mockedRepository.save).toHaveBeenCalledWith(expected)
    })

    it("should throw not found exception if user not found", async () => {
      const userId = 1
      const input: UpdateUserInput = {
        name: "Test",
        password: "updated-password",
      }

      mockedRepository.getById.mockRejectedValue(new NotFoundException())

      try {
        await service.updateUser(ctx, userId, input)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
      }
    })
  })
})
