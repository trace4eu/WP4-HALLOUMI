import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiConfigModule } from "../../config/configuration.js";
import { LogsService } from "./logs.service.js";
import { LogsController } from "./logs.controller.js";

@Module({
  imports: [ApiConfigModule],
  controllers: [LogsController],
  providers: [ConfigService, LogsService],
  exports: [LogsService],
})
export class LogsModule {}

export default LogsModule;
