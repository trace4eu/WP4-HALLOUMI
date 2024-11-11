import { randomUUID } from "node:crypto";
import { decodeJwt } from "jose";
import {  Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import qs from "qs";
import { createVerifiablePresentationJwt } from "@cef-ebsi/verifiable-presentation";
import type { EbsiIssuer } from "@cef-ebsi/verifiable-presentation";
import type { PresentationSubmission } from "@sphereon/pex-models";
import type { Cache } from "cache-manager";
import type { ApiConfig } from "../../config/configuration.js";
import { logAxiosError } from "../../shared/utils/index.js";
import { EbsiEnvConfiguration } from "@cef-ebsi/verifiable-credential";

// Refresh the token if it expires in less than 10 seconds
const REFRESH_LIMIT = 10 * 1000;

@Injectable()
export class EBSIAuthorisationService {
  private readonly logger = new Logger(EBSIAuthorisationService.name);

  private authorisationApiUrl: string;

  //private ebsiEnvConfig: EbsiEnvConfiguration;
  private domain: string;

  constructor(
    private configService: ConfigService<ApiConfig, true>,
   
  ) {
    this.domain = configService.get<string>("domain");
    //this.ebsiEnvConfig = configService.get("ebsiEnvConfig", { infer: true });
    this.authorisationApiUrl = this.configService.get<string>(
      "authorisationApiUrl"
    );
  }

  /**
   * Generic function to request an access token from Authorisation API v3.
   */
  private async requestAccessToken(
    scope: "tir_write" | "didr_invite" | "didr_write" | "tir_invite",
    subject: EbsiIssuer,
    verifiableCredential: string[] = []
  ): Promise<string> {
    const nonce = randomUUID();
    const vpPayload = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      verifiableCredential,
      holder: subject.did,
    };

    const vpJwt = await createVerifiablePresentationJwt(
      vpPayload,
      subject,
      this.authorisationApiUrl,
      {
        ebsiAuthority: this.authorisationApiUrl,
       // ...this.ebsiEnvConfig,
        skipValidation: true,
        nonce,
        ...(verifiableCredential.length === 0 && {
          // Manually add "exp" and "nbf" to the VP JWT because there's no VC to extract from
          exp: Math.floor(Date.now() / 1000) + 100,
          nbf: Math.floor(Date.now() / 1000) - 100,
        }),
      }
    );

    const presentationDefinitionsIds: Record<typeof scope, string> = {
      tir_write: "tir_write_presentation",
      didr_invite: "didr_invite_presentation",
      didr_write: "didr_write_presentation",
      tir_invite: "tir_invite_presentation",
    } as const;

    const presentationSubmission = {
      id: randomUUID(),
      definition_id: presentationDefinitionsIds[scope],
      descriptor_map: [] as PresentationSubmission["descriptor_map"],
    } satisfies PresentationSubmission;

    if (scope === "didr_invite") {
      presentationSubmission.descriptor_map.push({
        id: "didr_invite_credential",
        format: "jwt_vp",
        path: "$",
        path_nested: {
          id: "didr_invite_credential",
          format: "jwt_vc",
          path: "$.vp.verifiableCredential[0]",
        },
      });
    } else if (scope === "tir_invite") {
      presentationSubmission.descriptor_map.push({
        id: "tir_invite_credential",
        format: "jwt_vp",
        path: "$",
        path_nested: {
          id: "tir_invite_credential",
          format: "jwt_vc",
          path: "$.vp.verifiableCredential[0]",
        },
      });
    }

    const response = await axios.post<unknown>(
      `${this.authorisationApiUrl}/token`,
      new URLSearchParams({
        grant_type: "vp_token",
        scope: `openid ${scope}`,
        vp_token: vpJwt,
        presentation_submission: JSON.stringify(presentationSubmission),
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = (
      response.data as {
        access_token: string;
      }
    ).access_token;

    return accessToken;
  }

  /**
   * Method to get an access token from Authorisation API v3 or from cache if it's still valid.
   */
  async getAccessToken(
    scope: "tir_write" | "didr_invite" | "didr_write" | "tir_invite",
    subject: EbsiIssuer,
    verifiableCredential: string[] = []
  ) {
    const cacheKey = `access_token::${scope}::${subject.did}`;
    // const cachedAccessToken = await this.cacheManager.get<string>(cacheKey);

    // if (cachedAccessToken) {
    //   return cachedAccessToken;
    // }

    try {
      const accessToken = await this.requestAccessToken(
        scope,
        subject,
        verifiableCredential
      );

      // Only cache "tir_write" and "didr_write" tokens
      if (scope === "tir_write" || scope === "didr_write") {
        // Decode access token
        const accessTokenExp = Number(decodeJwt(accessToken).exp);

        // TTL (in milliseconds)
        // JWT exp is expressed in seconds, Date.now() and REFRESH_LIMIT in milliseconds
        const ttl = accessTokenExp * 1000 - Date.now() - REFRESH_LIMIT;

       // await this.cacheManager.set(cacheKey, accessToken, ttl);
      }

      return accessToken;
    } catch (err) {
      if (err instanceof Error) {
        if (axios.isAxiosError(err)) {
          logAxiosError(err, this.logger);
        } else {
          this.logger.error(err.message, err.stack);
        }
      } else {
        this.logger.error(err);
      }
      throw err;
    }
  }
}

export default EBSIAuthorisationService;
