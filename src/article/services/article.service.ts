import { Injectable, UnauthorizedException } from "@nestjs/common"
import { plainToClass } from "class-transformer"

import type {
  CreateArticleInput,
  UpdateArticleInput,
} from "@article/dtos/article-input.dto"
import { ArticleOutput } from "@article/dtos/article-output.dto"
import { Article } from "@article/entities/article.entity"
import { ArticleRepository } from "@article/repositories/article.repository"
import { Action } from "@shared/acl/action.constant"
import type { IActor } from "@shared/acl/actor.constant"
import { AppLogger } from "@shared/logger/logger.service"
import type { RequestContext } from "@shared/request-context/request-context.dto"
import { User } from "@user/entities/user.entity"
import { UserService } from "@user/services/user.service"

import { ArticleAclService } from "./article-acl.service"

@Injectable()
export class ArticleService {
  constructor(
    private repository: ArticleRepository,
    private userService: UserService,
    private aclService: ArticleAclService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ArticleService.name)
  }

  async createArticle(
    ctx: RequestContext,
    input: CreateArticleInput,
  ): Promise<ArticleOutput> {
    this.logger.log(ctx, `${this.createArticle.name} was called`)

    const article = plainToClass(Article, input)

    const actor: IActor = ctx.user

    const user = await this.userService.getUserById(ctx, actor.id)

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Create, article)
    if (!isAllowed) {
      throw new UnauthorizedException()
    }

    article.author = plainToClass(User, user)

    this.logger.log(ctx, `calling ${ArticleRepository.name}.save`)
    const savedArticle = await this.repository.save(article)

    return plainToClass(ArticleOutput, savedArticle, {
      excludeExtraneousValues: true,
    })
  }

  async getArticles(
    ctx: RequestContext,
    limit: number,
    offset: number,
  ): Promise<{ articles: ArticleOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getArticles.name} was called`)

    const actor: IActor = ctx.user

    const isAllowed = this.aclService.forActor(actor).canDoAction(Action.List)
    if (!isAllowed) {
      throw new UnauthorizedException()
    }

    this.logger.log(ctx, `calling ${ArticleRepository.name}.findAndCount`)
    const [articles, count] = await this.repository.findAndCount({
      skip: offset,
      take: limit,
      where: {},
    })

    const articlesOutput = plainToClass(ArticleOutput, articles, {
      excludeExtraneousValues: true,
    })

    return { articles: articlesOutput, count }
  }

  async getArticleById(ctx: RequestContext, id: number): Promise<ArticleOutput> {
    this.logger.log(ctx, `${this.getArticleById.name} was called`)

    const actor: IActor = ctx.user

    this.logger.log(ctx, `calling ${ArticleRepository.name}.getById`)
    const article = await this.repository.getById(id)

    const isAllowed = this.aclService.forActor(actor).canDoAction(Action.Read, article)
    if (!isAllowed) {
      throw new UnauthorizedException()
    }

    return plainToClass(ArticleOutput, article, {
      excludeExtraneousValues: true,
    })
  }

  async updateArticle(
    ctx: RequestContext,
    articleId: number,
    input: UpdateArticleInput,
  ): Promise<ArticleOutput> {
    this.logger.log(ctx, `${this.updateArticle.name} was called`)

    this.logger.log(ctx, `calling ${ArticleRepository.name}.getById`)
    const article = await this.repository.getById(articleId)

    const actor: IActor = ctx.user

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Update, article)
    if (!isAllowed) {
      throw new UnauthorizedException()
    }

    const updatedArticle: Article = {
      ...article,
      ...plainToClass(Article, input),
    }

    this.logger.log(ctx, `calling ${ArticleRepository.name}.save`)
    const savedArticle = await this.repository.save(updatedArticle)

    return plainToClass(ArticleOutput, savedArticle, {
      excludeExtraneousValues: true,
    })
  }

  async deleteArticle(ctx: RequestContext, id: number): Promise<void> {
    this.logger.log(ctx, `${this.deleteArticle.name} was called`)

    this.logger.log(ctx, `calling ${ArticleRepository.name}.getById`)
    const article = await this.repository.getById(id)

    const actor: IActor = ctx.user

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Delete, article)
    if (!isAllowed) {
      throw new UnauthorizedException()
    }

    this.logger.log(ctx, `calling ${ArticleRepository.name}.remove`)
    await this.repository.remove(article)
  }
}
