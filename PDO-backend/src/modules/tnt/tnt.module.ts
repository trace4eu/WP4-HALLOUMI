import {  Module } from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { ApiConfigModule } from "../../config/configuration.js";
import { TnTController } from "./tnt.controller.js";
import { TntService } from "./tnt.service.js";
import { DataStoreModule } from "../data-store/data-store.module.js";
import { LogsModule } from "../logs/logs.module.js";
import { EbsiModule } from "../ebsi/ebsi.module.js";


import { MongooseModule } from "@nestjs/mongoose";
import { IssuedVC, IssuedVCSchema } from "../../shared/models/issuedvcs.model.js";
import { RevList, RevListSchema } from "../../shared/models/revList.model.js";
import { CacheManagerOptions, CacheModule } from "@nestjs/cache-manager";
import { Product, ProductSchema } from "../../shared/models/products.model.js";

export const cacheConfig: CacheManagerOptions = {
  ttl: 0,
  max: 10_000,
};

@Module({
  imports: [
    ApiConfigModule,
   
    // DataStoreModule,
    // EbsiModule,
    // LogsModule,
   
    MongooseModule.forFeature([
     
      { name: IssuedVC.name, schema: IssuedVCSchema },
      { name: RevList.name, schema: RevListSchema},
      { name: Product.name, schema: ProductSchema},
   
    ]),
    CacheModule.register(cacheConfig),
    
  ],
  controllers: [TnTController],
  providers: [ConfigService, TntService],
  exports: [TntService],
})
export class TnTModule {}

export default TnTModule;
