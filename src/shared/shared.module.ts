import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core"
import { TypeOrmModule } from "@nestjs/typeorm"

import { configModuleOptions } from "./configs/module-options"
import { AllExceptionsFilter } from "./filters/all-exceptions.filter"
import { LoggingInterceptor } from "./interceptors/logging.interceptor"
import { AppLoggerModule } from "./logger/logger.module"

@Module({
  exports: [AppLoggerModule, ConfigModule],
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        database: configService.get<string>("database.name"),
        debug: configService.get<string>("env") === "development",
        entities: [__dirname + "/../**/entities/*.entity{.ts,.js}"],
        host: configService.get<string>("database.host"),
        password: configService.get<string>("database.pass"),
        port: configService.get<number | undefined>("database.port"),
        synchronize: false,
        /**
         * Timezone configured on the Postgres server.
         * This is used to typecast server date/time values to JavaScript Date object
         * and vice versa.
         */
        timezone: "Z",
        type: "postgres",
        username: configService.get<string>("database.user"),
      }),
    }),
    AppLoggerModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },

    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class SharedModule {}
