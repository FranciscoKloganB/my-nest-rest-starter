import { Module } from '@nestjs/common';

import { ArticleModule } from '@article/article.module';
import { AuthModule } from '@auth/auth.module';
import { SharedModule } from '@shared/shared.module';
import { UserModule } from '@user/user.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [SharedModule, UserModule, AuthModule, ArticleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
