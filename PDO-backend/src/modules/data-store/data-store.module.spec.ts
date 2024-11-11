import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { INestApplication, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { FastifyInstance } from "fastify";
import { configureApp } from "../../../tests/utils/app";
import { TI_REQUEST_VERIFIABLE_AUTHORISATION_TO_ONBOARD } from "../../shared/constants";
import type { IntentEvent } from "./data-store.interface";
import { DataStoreModule } from "./data-store.module";
import { DataStoreService } from "./data-store.service";

const DID = "did:ebsi:za6JmV84EuYeNirrqpjYcPB";

describe("Data Store Module", () => {
  let app: INestApplication;
  let dataStoreService: DataStoreService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DataStoreModule],
    }).compile();

    Logger.overrideLogger(false);

    app = await configureApp(moduleFixture);
    dataStoreService = moduleFixture.get<DataStoreService>(DataStoreService);

    await app.init();
    await (app.getHttpAdapter().getInstance() as FastifyInstance).ready();
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await app.close();
  });

  describe("datastore", () => {
    it("should set a key successfully", async () => {
      const intentEvent = {
        success: true,
        timestamp: 100,
        intent: TI_REQUEST_VERIFIABLE_AUTHORISATION_TO_ONBOARD,
      } satisfies IntentEvent;
      await dataStoreService.pushEvent(DID, intentEvent);
      const expectedData = await dataStoreService.getEvents(DID);
      expect([intentEvent]).toStrictEqual(expectedData);
    });

    it("should return undefined if key does not exists", async () => {
      const expectedData = await dataStoreService.getEvents("DID_NOT_EXISTS");
      expect(expectedData).toBeUndefined();
    });
  });
});
