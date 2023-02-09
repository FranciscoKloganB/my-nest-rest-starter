import { NotFoundException, UnauthorizedException } from "@nestjs/common"
import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"

import type { UpdateArticleInput } from "@article/dtos/article-input.dto"
import { CreateArticleInput } from "@article/dtos/article-input.dto"
import type { ArticleOutput } from "@article/dtos/article-output.dto"
import { Article } from "@article/entities/article.entity"
import { ArticleRepository } from "@article/repositories/article.repository"
import { ROLE } from "@auth/constants/role.constant"
import { AppLogger } from "@shared/logger/logger.service"
import { RequestContext } from "@shared/request-context/request-context.dto"
import { getAsyncError } from "@shared/test/utils"
import { UserOutput } from "@user/dtos/user-output.dto"
import { User } from "@user/entities/user.entity"
import { UserService } from "@user/services/user.service"

import { ArticleService } from "./article.service"
import { ArticleAclService } from "./article-acl.service"

describe("ArticleService", () => {
  let service: ArticleService
  let mockedRepository: any
  let mockedUserService: any
  const mockedLogger = { log: jest.fn(), setContext: jest.fn() }

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ArticleRepository,
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            getById: jest.fn(),
            remove: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
        { provide: ArticleAclService, useValue: new ArticleAclService() },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile()

    service = moduleRef.get<ArticleService>(ArticleService)
    mockedRepository = moduleRef.get(ArticleRepository)
    mockedUserService = moduleRef.get(UserService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  const ctx = new RequestContext()

  describe("Create Article", () => {
    it("should get user from user claims user id", () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: "testuser",
      }

      service.createArticle(ctx, new CreateArticleInput())
      expect(mockedUserService.getUserById).toHaveBeenCalledWith(ctx, 1)
    })

    it("should call repository save with proper article input and return proper output", async () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: "testuser",
      }

      const articleInput: CreateArticleInput = {
        post: "Hello, world!",
        title: "Test",
      }

      const author = new UserOutput()
      mockedUserService.getUserById.mockResolvedValue(author)
      const expected = {
        author,
        post: "Hello, world!",
        title: "Test",
      }

      const expectedOutput = {
        author: new User(),
        id: 1,
        post: "Hello, world!",
        title: "Test",
      }
      mockedRepository.save.mockResolvedValue(expectedOutput)

      const output = await service.createArticle(ctx, articleInput)
      expect(mockedRepository.save).toHaveBeenCalledWith(expected)
      expect(output).toEqual(expectedOutput)
    })
  })

  describe("getArticles", () => {
    const limit = 10
    const offset = 0
    const currentDate = new Date()

    it("should return articles when found", async () => {
      const expectedOutput: ArticleOutput[] = [
        {
          author: new User(),
          createdAt: currentDate,
          id: 1,
          post: "Hello, world!",
          title: "Test",
          updatedAt: currentDate,
        },
      ]

      mockedRepository.findAndCount.mockResolvedValue([
        expectedOutput,
        expectedOutput.length,
      ])

      expect(await service.getArticles(ctx, limit, offset)).toEqual({
        articles: expectedOutput,
        count: expectedOutput.length,
      })
    })

    it("should return empty array when articles are not found", async () => {
      const expectedOutput: ArticleOutput[] = []

      mockedRepository.findAndCount.mockResolvedValue([
        expectedOutput,
        expectedOutput.length,
      ])

      expect(await service.getArticles(ctx, limit, offset)).toEqual({
        articles: expectedOutput,
        count: expectedOutput.length,
      })
    })
  })

  describe("getArticle", () => {
    it("should return article by id when article is found", async () => {
      const id = 1
      const currentDate = new Date()

      const expectedOutput: ArticleOutput = {
        author: new User(),
        createdAt: currentDate,
        id: 1,
        post: "Hello, world!",
        title: "Test",
        updatedAt: currentDate,
      }

      mockedRepository.getById.mockResolvedValue(expectedOutput)

      expect(await service.getArticleById(ctx, id)).toEqual(expectedOutput)
    })

    it("should fail when article is not found and return the repository error", async () => {
      const id = 1

      mockedRepository.getById.mockRejectedValue({
        message: "error",
      })

      const error = await getAsyncError<Error>(() => service.getArticleById(ctx, id))

      expect(error.message).toEqual("error")
    })
  })

  describe("Update Article", () => {
    it("should get article by id", () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: "testuser",
      }
      const articleId = 1
      const input: UpdateArticleInput = {
        post: "New Post",
        title: "New Title",
      }

      const author = new User()
      author.id = 1
      mockedRepository.getById.mockResolvedValue({
        author,
        id: 1,
        post: "Old post",
        title: "Old title",
      })

      service.updateArticle(ctx, articleId, input)
      expect(mockedRepository.getById).toHaveBeenCalledWith(articleId)
    })

    it("should save article with updated title and post", async () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: "testuser",
      }
      const articleId = 1
      const input: UpdateArticleInput = {
        post: "New Post",
        title: "New Title",
      }
      const author = new User()
      author.id = 1

      mockedRepository.getById.mockResolvedValue({
        author,
        id: 1,
        post: "Old post",
        title: "Old title",
      })

      const expected = {
        author,
        id: 1,
        post: "New Post",
        title: "New Title",
      }
      await service.updateArticle(ctx, articleId, input)
      expect(mockedRepository.save).toHaveBeenCalledWith(expected)
    })

    it("should throw unauthorized exception when someone other than resource owner tries to update article", async () => {
      ctx.user = {
        id: 2,
        roles: [ROLE.USER],
        username: "testuser",
      }
      const articleId = 1
      const input: UpdateArticleInput = {
        post: "New Post",
        title: "New Title",
      }
      const author = new User()
      author.id = 1

      mockedRepository.getById.mockResolvedValue({
        author,
        id: 1,
        post: "Old post",
        title: "Old title",
      })

      try {
        await service.updateArticle(ctx, articleId, input)
      } catch (error) {
        expect(error.constructor).toEqual(UnauthorizedException)
        expect(mockedRepository.save).not.toHaveBeenCalled()
      }
    })
  })

  describe("deleteArticle", () => {
    const articleId = 1

    it("should call repository.remove with correct parameter", async () => {
      ctx.user = {
        id: 1,
        roles: [ROLE.USER],
        username: "testuser",
      }

      const author = new User()
      author.id = 1
      const foundArticle = new Article()
      foundArticle.id = articleId
      foundArticle.author = author

      mockedRepository.getById.mockResolvedValue(foundArticle)

      await service.deleteArticle(ctx, articleId)
      expect(mockedRepository.remove).toHaveBeenCalledWith(foundArticle)
    })

    it("should throw not found exception if article not found", async () => {
      mockedRepository.getById.mockRejectedValue(new NotFoundException())
      try {
        await service.deleteArticle(ctx, articleId)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
      }
    })

    it("should throw unauthorized exception when someone other than resource owner tries to delete article", async () => {
      ctx.user = {
        id: 2,
        roles: [ROLE.USER],
        username: "testuser",
      }
      const articleId = 1

      const author = new User()
      author.id = 1

      mockedRepository.getById.mockResolvedValue({
        author,
        id: 1,
        post: "Old post",
        title: "Old title",
      })

      try {
        await service.deleteArticle(ctx, articleId)
      } catch (error) {
        expect(error.constructor).toEqual(UnauthorizedException)
        expect(mockedRepository.save).not.toHaveBeenCalled()
      }
    })
  })
})
