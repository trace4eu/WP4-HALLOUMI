import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { BigNumber } from "ethers";
import type { ApiConfig } from "../../config/configuration.js";

export type LokiLog = {
  stream?: unknown;
  values: [[string, string]];
};

export type LokiLogResponse = {
  data?: {
    result?: LokiLog[];
  };
};

type ParsedLokiLogItem = {
  Data: unknown;
  intent: string;
  result: {
    errors?: string[];
    success: boolean;
  };
};

@Injectable()
export class LogsService {
  private readonly lokiUrl: string;

  private readonly lokiAuthToken: string;

  private readonly lokiLogsLifetime: number;

  private readonly requestTimeout: number;

  constructor(private configService: ConfigService<ApiConfig, true>) {
    this.lokiUrl = this.configService.get<string>("lokiUrl");
    this.lokiAuthToken = this.configService.get<string>("lokiAuthToken");
    this.lokiLogsLifetime = this.configService.get<number>("lokiLogsLifetime");
    this.requestTimeout = this.configService.get<number>("requestTimeout");
  }

  async getLogsFromLoki(did: string) {
    const now = Date.now();
    const url = this.lokiUrl
      .replace(":uuid", encodeURIComponent(did))
      .replace(
        ":start",
        Math.floor((now - this.lokiLogsLifetime) / 1000).toString()
      )
      .replace(":end", Math.floor(now / 1000).toString());

    const response = await axios.get<LokiLogResponse>(url, {
      headers: {
        Authorization: `Basic ${this.lokiAuthToken}`,
      },
      timeout: this.requestTimeout,
    });

    return response?.data?.data?.result;
  }

  private getTextBetweenWords(startWord: string, endWord: string, str: string) {
    const pos = str.indexOf(startWord) + startWord.length;
    return str.substring(pos, str.indexOf(endWord, pos));
  }

  async getParsedLogs(did: string) {
    const lokiLogs = await this.getLogsFromLoki(did);

    if (lokiLogs?.length) {
      return lokiLogs
        .filter((log) => {
          try {
            JSON.parse(
              this.getTextBetweenWords(
                "Test Data",
                "End Test Data",
                log.values[0][1]
              )
            );
            return true;
          } catch (ex) {
            return false;
          }
        })
        .map((log: LokiLog) => {
          const { intent, result } = JSON.parse(
            this.getTextBetweenWords(
              "Test Data",
              "End Test Data",
              log.values[0][1]
            )
          ) as ParsedLokiLogItem;
          return {
            timestamp: BigNumber.from(log.values[0][0]).div(1000000).toString(),
            testData: {
              intent,
              result,
            },
          };
        });
    }

    return [];
  }
}

export default LogsService;
