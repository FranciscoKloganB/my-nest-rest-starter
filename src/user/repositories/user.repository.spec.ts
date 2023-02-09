import { NotFoundException } from "@nestjs/common"
import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"

import { ROLE } from "@auth/constants/role.constant"
import type { User } from "@user/entities/user.entity"

import { UserRepository } from "./user.repository"

describe("UserRepository", () => {
  let repository: UserRepository

  let dataSource: {
    createEntityManager: jest.Mock
  }

  beforeEach(async () => {
    dataSource = {
      createEntityManager: jest.fn(),
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile()

    repository = moduleRef.get<UserRepository>(UserRepository)
  })

  it("should be defined", () => {
    expect(repository).toBeDefined()
  })

  describe("Get user by id", () => {
    const currentDate = new Date()
    it("should call findOne with correct id", () => {
      const id = 1

      const expectedOutput: User = {
        articles: [],
        createdAt: currentDate,
        email: "default-user@random.com",
        id,
        isAccountDisabled: false,
        name: "Default User",
        password: "random-password",
        roles: [ROLE.USER],
        updatedAt: currentDate,
        username: "default-user",
      }

      jest.spyOn(repository, "findOne").mockResolvedValue(expectedOutput)
      repository.getById(id)
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } })
    })

    it("should return user if found", async () => {
      const expectedOutput: User = {
        articles: [],
        createdAt: currentDate,
        email: "default-user@random.com",
        id: 1,
        isAccountDisabled: false,
        name: "Default User",
        password: "random-password",
        roles: [ROLE.USER],
        updatedAt: currentDate,
        username: "default-user",
      }

      jest.spyOn(repository, "findOne").mockResolvedValue(expectedOutput)

      expect(await repository.getById(1)).toEqual(expectedOutput)
    })

    it("should throw NotFoundError when user not found", async () => {
      jest.spyOn(repository, "findOne").mockResolvedValue(undefined)
      try {
        await repository.getById(1)
      } catch (error) {
        expect(error.constructor).toBe(NotFoundException)
      }
    })
  })
})
