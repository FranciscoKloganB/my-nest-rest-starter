import { Injectable } from '@nestjs/common';

import { Article } from '@article/entities/article.entity';
import { ROLE } from '@auth/constants/role.constant';
import { BaseAclService } from '@shared/acl/acl.service';
import { Action } from '@shared/acl/action.constant';
import { Actor } from '@shared/acl/actor.constant';

@Injectable()
export class ArticleAclService extends BaseAclService<Article> {
  constructor() {
    super();
    this.canDo(ROLE.ADMIN, [Action.Manage]);
    this.canDo(ROLE.USER, [Action.Create, Action.List, Action.Read]);
    this.canDo(ROLE.USER, [Action.Update, Action.Delete], this.isArticleAuthor);
  }

  isArticleAuthor(article: Article, user: Actor): boolean {
    return article.author.id === user.id;
  }
}
