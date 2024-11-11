import { MiddlewareConsumer, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ApiConfigModule } from "./config/configuration.js";
import { HealthModule } from "./modules/health/health.module.js";

import { TnTModule } from "./modules/tnt/tnt.module.js";
// import { ClientMockModule } from "./modules/client-mock/client-mock.module";
import { LoggingInterceptor } from "./interceptors/logging.interceptor.js";
//import { CheckModule } from "./modules/check/check.module";
import { LogsModule } from "./modules/logs/logs.module.js";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./modules/users/user.module.js";
import { AuthMiddleware } from "./middleware/auth.middleware.js";
import AdminModule from "./modules/admin/admin.module.js";
import AuthModule from "./modules/auth/auth.module.js";


@Module({
  imports: [
    ApiConfigModule,
    //EventModule,
    HealthModule,
    AuthModule,
    TnTModule,
    
    // ClientMockModule,
  //  CheckModule,
    AdminModule,
    LogsModule,
    MongooseModule.forRoot(`${process.env["MONGO_URL"]}`),
    UserModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('/admin/getProfile')
      .forRoutes('/admin/(.*)');
  }
}

export default AppModule;
