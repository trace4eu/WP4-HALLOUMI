import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { fastifyFormbody }  from "@fastify/formbody";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { fastifyHelmet } from "@fastify/helmet";
import qs from "qs";
import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./filters/http-exception.filter.js";
import { createLogger, consoleTransport } from "./logger/logger.js";
import type { ApiConfig } from "./config/configuration.js";
import { setupInterceptors } from "./axiosInterceptors.js";
import {readFile, readFileSync } from 'fs';
import { join } from "path";
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const querystringParser = (str: string) =>
  qs.parse(str, {
    // Parse up to 50 children deep
    depth: 50,
    // Parse up to 1000 parameters
    parameterLimit: 1000,
  });

  const isHttps:string|undefined = process.env['SETHTTPS'] ;
  const httpsOptions = {
    key: readFileSync('../certs/cert.key'),
   cert: readFileSync('../certs/cert.crt'),
  //  key: readFileSync('./privkey.pem'),   //testissuer.acgoldman.com
   //  cert: readFileSync('./fullchain.pem'),
   //push test
  };

async function bootstrap(): Promise<void> {
  const fastifyAdapter = new FastifyAdapter({
    querystringParser, // Replace default querystring parser. See https://www.fastify.io/docs/latest/Reference/Server/#querystringparser
    maxParamLength: 200, // Increase max param length for key dids. See https://www.fastify.io/docs/latest/Reference/Server/#maxparamlength
    ...(isHttps ? {https: httpsOptions} : null),  //add this to enable https
  });

  fastifyAdapter.enableCors({ methods: "*" });
  

  // Register "application/x-www-form-urlencoded" parser
  // @ts-expect-error - some types mismatch
  
  await fastifyAdapter.register(fastifyFormbody, {
    parser: querystringParser,
  });

  const logger = createLogger();

  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { logger, bodyParser: false }
  );

  const configService = app.get<ConfigService<ApiConfig, true>>(ConfigService);
  const apiUrlPrefix = configService.get<string>("apiUrlPrefix");
  const port = configService.get<number>("apiPort");
  const logLevel = configService.get<string>("logLevel");
  const domain = configService.get<string>("domain");
  const localOrigin = configService.get<string>("localOrigin");

  // Set logger level
  if (logLevel === "silent") {
    consoleTransport.silent = true;
  } else {
    consoleTransport.level = logLevel;
  }

  if (logger.debug) {
    logger.debug(
      `Starting API with:
- NODE_ENV: ${process.env.NODE_ENV}
- API_URL_PREFIX:${apiUrlPrefix}
- API_PORT:${port}
- LOG_LEVEL: ${logLevel}
`,
      "main"
    );
  }

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  app.setGlobalPrefix(apiUrlPrefix);

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });

  // await app.register(fastifyFormbody, {
  //   parser: querystringParser,
  // });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({  /*whitelist: true,
      forbidNonWhitelisted: false,*/transform: true, stopAtFirstError: true })
  );

  // Setup axios interceptors
  setupInterceptors(domain, localOrigin, logger);

  const document = JSON.parse(
     readFileSync(join(process.cwd(), './api/cyopenapi.json')).toString('utf-8') 
    )  as OpenAPIObject;
  if (document)
    SwaggerModule.setup('api', app, document);

  // Notes:
  // - see https://github.com/nestjs/nest/issues/3209
  // - read Note https://www.fastify.io/docs/latest/Getting-Started/#your-first-server
  await app.listen(port, "0.0.0.0", (err: Error, address: string) => {
    if (err) {
      logger.error(err.message, undefined, "main");
    } else {
      logger.log(`Server listening on ${address}`, "main");
    }
  });
}

bootstrap()
  .then(() => {})
  .catch((e) => {
    throw e;
  });
