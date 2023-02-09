import { NotFoundException } from "@nestjs/common"
import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"

import { Article } from "@article/entities/article.entity"
import { User } from "@user/entities/user.entity"

import { ArticleRepository } from "./article.repository"

describe("ArticleRepository", () => {
  let repository: ArticleRepository

  let dataSource: {
    createEntityManager: jest.Mock
  }

  beforeEach(async () => {
    dataSource = {
      createEntityManager: jest.fn(),
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleRepository,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile()

    repository = moduleRef.get<ArticleRepository>(ArticleRepository)
  })

  it("should be defined", () => {
    expect(repository).toBeDefined()
  })

  describe("Get article by id", () => {
    it("should call findOne with correct id", () => {
      const id = 1

      jest.spyOn(repository, "findOne").mockResolvedValue(new Article())
      repository.getById(id)
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } })
    })

    it("should return article if found", async () => {
      const expectedOutput: any = {
        author: new User(),
        id: 1,
        post: "Hello, world!",
        title: "Default Article",
      }

      jest.spyOn(repository, "findOne").mockResolvedValue(expectedOutput)

      expect(await repository.getById(1)).toEqual(expectedOutput)
    })

    it("should throw NotFoundError when article not found", async () => {
      jest.spyOn(repository, "findOne").mockResolvedValue(undefined)
      try {
        await repository.getById(1)
      } catch (error) {
        expect(error.constructor).toBe(NotFoundException)
      }
    })
  })
})
