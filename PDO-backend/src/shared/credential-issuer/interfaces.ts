import type { CredentialOfferPayload } from "../../modules/tnt/tnt.interface.js";
/**
 * OpenID Provider (OP) Metadata
 *
 * Specs:
 * - https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-10.2.3
 */
export interface CredentialIssuerMetadata {
  /**
   * The Credential Issuer's identifier.
   */
  credential_issuer: string;

  /**
   * Identifier of the OAuth 2.0 Authorization Server (as defined in [RFC8414]) the
   * Credential Issuer relies on for authorization. If this element is omitted, the entity
   * providing the Credential Issuer is also acting as the AS, i.e. the Credential Issuer's
   * identifier is used as the OAuth 2.0 Issuer value to obtain the Authorization Server metadata
   * as per [RFC8414].
   */
  authorization_server?: string;

  /**
   * URL of the Credential Issuer's Credential Endpoint. This URL MUST use the https scheme and MAY
   * contain port, path and query parameter components.
   */
  credential_endpoint: string;

  /**
   * URL of the Credential Issuer's Deferred Credential Endpoint. This URL MUST use the https
   * scheme and MAY contain port, path and query parameter components.
   */
  deferred_credential_endpoint: string;

  /**
   * A JSON array containing a list of JSON objects, each of them representing metadata about a
   * separate credential type that the Credential Issuer can issue. The JSON objects in the array
   * MUST conform to the structure of the Section 10.2.3.1.
   *
   * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-10.2.3.1
   */
  credentials_supported: {
    /**
     * A JSON string identifying the format of this credential, e.g. `jwt_vc_json` or `ldp_vc`.
     * Depending on the format value, the object contains further elements defining the type and
     * (optionally) particular claims the credential MAY contain, and information how to display
     * the credential. Appendix E defines Credential Format Profiles introduced by this
     * specification.
     *
     * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-e.1
     *
     * WARNING: https://github.com/Sphereon-Opensource/PEX does not support `jwt_vc_json`.
     * For this reason, we use `jwt_vc` instead.
     */
    format: "jwt_vc";

    /**
     * JSON array designating the types a certain credential type supports according to [VC_DATA],
     * Section 4.3.
     */
    types: string[];

    /**
     * A JSON array of JSON objects with information about the supported trust frameworks.
     * The 'name' property must uniquely define the trust framework.
     */
    trust_framework: {
      /**
       * Unique Trust Framework name. MUST be 'ebsi'.
       */
      name: "ebsi";

      /**
       *
       */
      type: string;
      uri: string;
    };

    /**
     * An array of objects, where each object contains display properties of a certain claim in the
     * Credential for a certain language.
     */
    display: {
      /**
       * String value of a display name for the claim.
       */
      name: string;

      /**
       * String value that identifies language of this object represented as language tag values
       * defined in BCP47 [RFC5646]. There MUST be only one object with the same language
       * identifier.
       */
      locale: string;
    }[];
  }[];
}

export interface UnsignedTransaction {
  from: string;
  to: string;
  data: string;
  nonce: string;
  chainId: string;
  gasLimit: string;
  gasPrice: string;
  value: string;
}

/**
 * Types from Ledger API v3
 */
export interface BesuTransactionReceipt {
  status: string;
  revertReason: string;
}

export interface CredentialResponse {
  format: "jwt_vc";
  credential: string;
}

export interface DeferredCredentialResponse {
  acceptance_token: string;
}

export interface CachedVcJwt {
  vcJwt: string;
  notBefore?: number;
}

export interface CachedNonce {
  nonce: string;
}

export type CachedCredentialOffer = CredentialOfferPayload;

export type LevelDbKeyIssuer = {
  did: string;
  nonceAccessToken?: string;
};

export type LevelDbObjectIssuer = CachedNonce | CachedVcJwt | CachedCredentialOffer;
