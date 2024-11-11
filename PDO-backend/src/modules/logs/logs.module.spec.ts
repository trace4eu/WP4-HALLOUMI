import {
  afterEach,
  beforeAll,
  jest,
  describe,
  it,
  expect,
} from "@jest/globals";
import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import type { FastifyInstance } from "fastify";
import { HttpServer, INestApplication, Logger } from "@nestjs/common";
import axios from "axios";
import { configureApp } from "../../../tests/utils/app";
import { LogsModule } from "./logs.module";
import { LogsService, LokiLog } from "./logs.service";

describe("Logs Module", () => {
  let app: INestApplication;
  let server: HttpServer;
  let logsService: LogsService;

  const mockedLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LogsModule],
    }).compile();

    app = await configureApp(moduleFixture);
    server = app.getHttpServer() as HttpServer;
    logsService = await moduleFixture.resolve<LogsService>(LogsService);

    Logger.overrideLogger(mockedLogger);

    await app.init();
    await (app.getHttpAdapter().getInstance() as FastifyInstance).ready();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the logs associated with a DID", async () => {
    expect.assertions(2);
    const did = "did:ebsi:za6JmV84EuYeNirrqpjYcPB";

    const lokiResponseData = {
      data: {
        result: [
          {
            values: [
              [
                "1660734188205405478",
                '\u001b[32m[Conformance API v3]\u001b[39m \u001b[33mInfo\u001b[39m\\t4/7/2023, 11:28:28 AM \u001b[33m[CheckService]\u001b[39m \u001b[32mTest Data {"intent": "tao_request_verifiable_accreditation_to_accredit", "data": {"did":"did:ebsi:z24q8qN8UE1j4XAFiFKtvJbH","clientId":"https://www.google.com"}, "result": {"success":false,"errors":["No events for intents registered!"]}} End Test Data\u001b[39m - {}',
              ],
            ],
          },
        ],
      },
    };

    jest
      .spyOn(axios, "get")
      .mockImplementation(() => Promise.resolve({ data: lokiResponseData }));

    const response = await request(server).get(`/logs/loki/${did}`).send();

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(lokiResponseData.data.result);
  });

  it("should return the parsed logs associated with a DID", async () => {
    const did = "did:ebsi:za6JmV84EuYeNirrqpjYcPB";
    const key =
      "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbsDbVZXdb3jzCagESyY4EE2x7Yjx3gNwctoEuRCKKDrdNP3HPFtG8RTvBiYStT5ghBHhHizH2Dy6xQtW3Pd2SecizL9b2jzDCMr7Ka5cRAWZFwvqwAtwTT7xet769y9ERh6";

    const lokiResponseData = {
      values: [
        [
          "1660734188205405478",
          '\u001b[32m[Conformance API v3]\u001b[39m \u001b[33mInfo\u001b[39m\\t4/7/2023, 11:28:28 AM \u001b[33m[CheckService]\u001b[39m \u001b[32mTest Data {"intent": "tao_request_verifiable_accreditation_to_accredit", "data": {"did":"did:ebsi:z24q8qN8UE1j4XAFiFKtvJbH","clientId":"https://www.google.com"}, "result": {"success":false,"errors":["No events for intents registered!"]}} End Test Data\u001b[39m - {}',
        ],
      ],
    } satisfies LokiLog;

    jest
      .spyOn(logsService, "getLogsFromLoki")
      .mockImplementation(() => Promise.resolve([lokiResponseData]));

    let response = await request(server).get(`/logs/${did}`).send();
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([
      {
        timestamp: "1660734188205",
        testData: {
          intent: "tao_request_verifiable_accreditation_to_accredit",
          result: {
            errors: ["No events for intents registered!"],
            success: false,
          },
        },
      },
    ]);

    response = await request(server).get(`/logs/${key}`).send();
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([
      {
        timestamp: "1660734188205",
        testData: {
          intent: "tao_request_verifiable_accreditation_to_accredit",
          result: {
            errors: ["No events for intents registered!"],
            success: false,
          },
        },
      },
    ]);
  });
});
