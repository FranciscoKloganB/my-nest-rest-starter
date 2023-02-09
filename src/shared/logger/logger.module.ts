import { Module } from "@nestjs/common"

import { AppLogger } from "./logger.service"

@Module({
  exports: [AppLogger],
  imports: [],
  providers: [AppLogger],
})
export class AppLoggerModule {}
