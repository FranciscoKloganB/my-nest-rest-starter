import type { TestingModule } from "@nestjs/testing"
import { Test } from "@nestjs/testing"

import type {
  CreateArticleInput,
  UpdateArticleInput,
} from "@article/dtos/article-input.dto"
import type { ArticleOutput } from "@article/dtos/article-output.dto"
import { ArticleService } from "@article/services/article.service"
import type { PaginationParamsDto } from "@shared/dtos/pagination-params.dto"
import { AppLogger } from "@shared/logger/logger.service"
import { RequestContext } from "@shared/request-context/request-context.dto"
import { getAsyncError } from "@shared/test/utils"
import { User } from "@user/entities/user.entity"

import { ArticleController } from "./article.controller"

describe("ArticleController", () => {
  let controller: ArticleController
  const mockedArticleService = {
    createArticle: jest.fn(),
    deleteArticle: jest.fn(),
    getArticleById: jest.fn(),
    getArticles: jest.fn(),
    updateArticle: jest.fn(),
  }
  const mockedLogger = { log: jest.fn(), setContext: jest.fn() }

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        { provide: ArticleService, useValue: mockedArticleService },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile()

    controller = moduleRef.get<ArticleController>(ArticleController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  const ctx = new RequestContext()

  describe("Create article", () => {
    let input: CreateArticleInput

    beforeEach(() => {
      input = {
        post: "Hello, world!",
        title: "Test",
      }
    })

    it("should call articleService.createArticle with correct input", () => {
      controller.createArticle(ctx, input)
      expect(mockedArticleService.createArticle).toHaveBeenCalledWith(ctx, input)
    })

    it("should return data which includes info from articleService.createArticle", async () => {
      const currentDate = new Date()
      const expectedOutput: ArticleOutput = {
        author: new User(),
        createdAt: currentDate,
        id: 1,
        post: "Hello, world!",
        title: "Test",
        updatedAt: currentDate,
      }

      mockedArticleService.createArticle.mockResolvedValue(expectedOutput)

      expect(await controller.createArticle(ctx, input)).toEqual({
        data: expectedOutput,
        meta: {},
      })
    })

    it("should throw error when articleService.createArticle throws an error", async () => {
      mockedArticleService.createArticle.mockRejectedValue({
        message: "rejected",
      })

      const error = await getAsyncError<Error>(() =>
        controller.createArticle(ctx, input),
      )

      expect(error.message).toEqual("rejected")
    })
  })

  describe("Get articles", () => {
    it("should call service method getArticles", () => {
      mockedArticleService.getArticles.mockResolvedValue({
        articles: [],
        meta: null,
      })
      const queryParams: PaginationParamsDto = {
        limit: 100,
        offset: 0,
      }

      controller.getArticles(ctx, queryParams)
      expect(mockedArticleService.getArticles).toHaveBeenCalledWith(
        ctx,
        queryParams.limit,
        queryParams.offset,
      )
    })
  })

  describe("Get article by id", () => {
    it("should call service method getArticleById with id", () => {
      const id = 1

      controller.getArticle(ctx, id)
      expect(mockedArticleService.getArticleById).toHaveBeenCalledWith(ctx, id)
    })
  })

  describe("Update article", () => {
    it("should call articleService.updateArticle with correct parameters", () => {
      const articleId = 1
      const input: UpdateArticleInput = {
        post: "Hello, world!",
        title: "Test",
      }
      controller.updateArticle(ctx, articleId, input)
      expect(mockedArticleService.updateArticle).toHaveBeenCalledWith(
        ctx,
        articleId,
        input,
      )
    })
  })

  describe("Delete article", () => {
    it("should call articleService.deleteArticle with correct id", () => {
      const articleId = 1
      controller.deleteArticle(ctx, articleId)
      expect(mockedArticleService.deleteArticle).toHaveBeenCalledWith(ctx, articleId)
    })
  })
})
