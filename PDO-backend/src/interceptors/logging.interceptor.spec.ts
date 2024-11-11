import {
  jest,
  describe,
  beforeAll,
  afterEach,
  it,
  expect,
  afterAll,
} from "@jest/globals";
import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import type { FastifyInstance } from "fastify";
import { of } from "rxjs";
import { AppModule } from "../app.module";
import { configureApp } from "../../tests/utils/app";

jest.setTimeout(60000);

describe("Logging interceptor", () => {
  let app: INestApplication;
  let httpService: HttpService;

  const mockedLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await configureApp(moduleFixture);

    Logger.overrideLogger(mockedLogger);

    await app.init();
    await (app.getHttpAdapter().getInstance() as FastifyInstance).ready();

    httpService = await moduleFixture.resolve<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Avoid jest open handle error
    await new Promise((r) => {
      setTimeout(r, 500);
    });
    await app.close();
  });

  describe("GET /health", () => {
    it("should NOT log the request and response", async () => {
      expect.assertions(1);

      await request(app.getHttpServer()).get(`/health`);

      const calls = mockedLogger.log.mock.calls.length;
      expect(mockedLogger.log).toHaveBeenNthCalledWith(
        calls,
        "Nest application successfully started",
        "NestApplication"
      );
    });
  });

  describe("GET /auth-mock/jwks", () => {
    it("should log the request and response", async () => {
      expect.assertions(2);

      jest
        .spyOn(httpService, "request")
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockImplementation(() => of({}));

      await request(app.getHttpServer()).get("/auth-mock/jwks");

      const calls = mockedLogger.log.mock.calls.length;

      // It should have logged the request
      expect(mockedLogger.log).toHaveBeenNthCalledWith(
        calls - 1,
        {
          headers: {
            "accept-encoding": "gzip, deflate",
            connection: "close",
            host: expect.stringContaining("127.0.0.1:"),
          },
          message: "Incoming request - GET - /auth-mock/jwks",
          method: "GET",
          body: undefined,
        },
        "LoggingInterceptor - GET - /auth-mock/jwks",
        "LoggingInterceptor"
      );

      // It should have logged the response
      expect(mockedLogger.log).toHaveBeenNthCalledWith(
        calls,
        {
          body: {
            keys: expect.any(Array),
          },
          message: "Outgoing response - 200 - GET - /auth-mock/jwks",
        },
        "LoggingInterceptor - 200 - GET - /auth-mock/jwks",
        "LoggingInterceptor"
      );
    });
  });

  describe("POST /auth-mock/direct_post with bad payload", () => {
    it("should log the request and response", async () => {
      expect.assertions(2);

      await request(app.getHttpServer())
        .post("/auth-mock/direct_post")
        .send("invalid body");

      const logCalls = mockedLogger.log.mock.calls.length;
      const errorCalls = mockedLogger.error.mock.calls.length;

      // It should have logged the request
      expect(mockedLogger.log).toHaveBeenNthCalledWith(
        logCalls,
        {
          body: { "invalid body": "" },
          headers: {
            "accept-encoding": "gzip, deflate",
            connection: "close",
            "content-length": "12",
            "content-type": "application/x-www-form-urlencoded",
            host: expect.stringContaining("127.0.0.1:"),
          },
          message: "Incoming request - POST - /auth-mock/direct_post",
          method: "POST",
        },
        "LoggingInterceptor - POST - /auth-mock/direct_post",
        "LoggingInterceptor"
      );

      // It should have logged the response
      expect(mockedLogger.error).toHaveBeenNthCalledWith(
        errorCalls - 1,
        {
          message: "Outgoing response - POST - /auth-mock/direct_post",
        },
        expect.stringContaining("BadRequestError"),
        "LoggingInterceptor - POST - /auth-mock/direct_post",
        "LoggingInterceptor"
      );
    });
  });
});
