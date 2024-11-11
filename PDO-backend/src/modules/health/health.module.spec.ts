import { jest, describe, beforeAll, afterAll, it, expect } from "@jest/globals";
import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpServer, Logger } from "@nestjs/common";
import type { HealthIndicatorResult } from "@nestjs/terminus";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import type { FastifyInstance } from "fastify";
import { of } from "rxjs";
import type { ApiConfig } from "../../config/configuration";
import { HealthModule } from "./health.module";
import { configureApp } from "../../../tests/utils/app";

describe("Health Module", () => {
  let app: NestFastifyApplication;
  let server: HttpServer;
  let httpService: HttpService;
  let configService: ConfigService<ApiConfig>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    Logger.overrideLogger(false);

    app = await configureApp(moduleFixture);

    await app.init();
    await (app.getHttpAdapter().getInstance() as FastifyInstance).ready();
    server = app.getHttpServer() as HttpServer;

    configService = moduleFixture.get<ConfigService<ApiConfig>>(ConfigService);

    httpService = await moduleFixture.resolve<HttpService>(HttpService);
  });

  afterAll(async () => {
    // Avoid jest open handle error
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await app.close();
  });

  describe("check", () => {
    it("should return 'ok'", async () => {
      expect.assertions(3);

      const status = { "ebsi-apis": { status: "up" } } as HealthIndicatorResult;

      const spy = jest
        .spyOn(httpService, "request")
        // @ts-expect-error - We don't care about the response body
        .mockImplementation(() => of({}));

      const response = await request(server).get("/health").send();

      expect(spy).toHaveBeenCalledWith({
        url: configService.get<string>("externalEbsiApiHealthCheck"),
      });
      expect(response.body).toStrictEqual({
        details: status,
        error: {},
        info: status,
        status: "ok",
      });
      expect(response.status).toBe(200);
    });
  });
});
