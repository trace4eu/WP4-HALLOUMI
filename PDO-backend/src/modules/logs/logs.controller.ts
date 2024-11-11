import { Controller, Get, Param } from "@nestjs/common";
import { LogsService } from "./logs.service.js";

@Controller("/logs")
export class LogsController {
  constructor(private logsService: LogsService) {}

  @Get("/loki/:did")
  async getLokiLogs(@Param("did") did: string) {
    return this.logsService.getLogsFromLoki(did);
  }

  @Get("/:did")
  getParsedLogs(@Param("did") did: string) {
    return this.logsService.getParsedLogs(did);
  }
}

export default LogsController;
