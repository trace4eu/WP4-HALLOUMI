import { Module } from "@nestjs/common";
import {CacheModule } from "@nestjs/cache-manager";
import CacheService from "./cache.service.js";
import { cacheConfig } from "../config/configuration.js";

@Module({
    imports: [
        
       CacheModule.register(cacheConfig),
    ],
    exports: [CacheModule],
    providers: [CacheService]
  })

export class CacheModuleYC {}