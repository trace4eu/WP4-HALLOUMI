import {  Module } from "@nestjs/common";
import { DataStoreService } from "./data-store.service.js";


@Module({
  imports: [],
  controllers: [],
  providers: [DataStoreService],
  exports: [DataStoreService],
})
export class DataStoreModule {}

export default DataStoreModule;
