import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiConfigModule } from "../../config/configuration.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import CacheService from "../../cache/cache.service.js";

import { CacheModuleYC } from "../../cache/cache.module.js";
// import CacheService from "../../cache/cache.service.js";
import { MongooseModule } from "@nestjs/mongoose";

import { IssuedVC, IssuedVCSchema } from "../../shared/models/issuedvcs.model.js";


@Module({
  imports: [ApiConfigModule,
    CacheModuleYC,
     MongooseModule.forFeature([
      
    
    
      { name: IssuedVC.name, schema: IssuedVCSchema },
    ]),
    ],
     //CacheModule.register(cacheConfig)],
  controllers: [AuthController],
  providers: [ConfigService,  AuthService,  CacheService],
  exports: [AuthService],
})
export class AuthModule {}

export default AuthModule;
