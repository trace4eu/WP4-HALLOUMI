import type { ISSUER_CHECKS_LIST } from "./tnt.constants.js";
import type { CheckResult } from "../../shared/interfaces.js";

/**
 * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-7.3
 */
export type CheckName = (typeof ISSUER_CHECKS_LIST)[number];

export type CheckParams = unknown;

export type CheckFunction = (
  data: CheckParams
) => Promise<CheckResult> | CheckResult;

export type ChecksMap = Record<CheckName, CheckFunction>;

/**
 * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#name-credential-offer
 */
export type CredentialOffer = {
  credential_offer?: string; // The credential_offer is a stringified CredentialOfferPayload
  credential_offer_uri?: string; // URI to the credential offer
};

/**
 * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#name-credential-offer
 */
export type CredentialOfferPayload = {
  
    credential_issuer: string;
    credentials: {
      format: "jwt_vc";
      types: string[];
      trust_framework: {
        name: string;
        type: string;
        uri: string;
      };
    }[];
    grants: {
      // authorization_code?: {
      //   issuer_state: string;
      // };
      // "urn:ietf:params:oauth:grant-type:pre-authorized_code"?: {
      //   "pre-authorized_code": string;
      //   user_pin_required: boolean;
      // };
    };
    flowtype:string;
    walleturl:string;
  
};

export type VerifierFlowAuthorisationRequest = {
  scope: "openid ver_test:id_token" | "openid ver_test:vp_token";
  client_id: string;
  client_metadata: string;
  redirect_uri: "openid://";
  response_type: "code";
  nonce: string;
  state: string;
};

export type VerifyResponse = {
  status: string;
}

export interface CredentialResponse {
  format: "jwt_vc";
  credential: string;
}

export interface DeferredCredentialResponse {
  acceptance_token: string;
}