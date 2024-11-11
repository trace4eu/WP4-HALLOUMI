import {  Module } from "@nestjs/common";
import { EBSIAuthorisationService } from "./authorisation.service.js";
import { ApiConfigModule, } from "../../config/configuration.js";

@Module({
  imports: [ApiConfigModule,],
  controllers: [],
  providers: [EBSIAuthorisationService],
  exports: [EBSIAuthorisationService],
})
export class EbsiModule {}

export default EbsiModule;
