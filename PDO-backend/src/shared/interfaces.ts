import type { JsonWebKey } from "crypto";
import type {
  HOLDER_WALLET_CREDENTIAL_TYPES,
  INTENTS_LIST,
  ISSUER_TYPES,
} from "./constants.js";

/**
 * JWK Set
 *
 * Specs:
 * - https://www.rfc-editor.org/rfc/rfc7517.html#section-5
 */
export interface JsonWebKeySet {
  keys: JsonWebKey[];
}

export type NewPinResult = {
  pin: string;

}

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
    trust_framework?: {
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

/**
 * Client Metadata
 *
 * Specs:
 * @see https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
 * @see https://www.rfc-editor.org/rfc/rfc7591.html#section-4.1
 * @see https://openid.net/specs/openid-connect-self-issued-v2-1_0.html#name-dynamic-discovery-of-self-i
 */
export interface ClientMetadata {
  /**
   * REQUIRED. URL of the OP's JSON Web Key Set document. This contains the signing key(s) the RP
   * uses to validate signatures from the OP. The JWK Set MAY also contain the Server's encryption
   * key(s), which are used by RPs to encrypt requests to the Server. When both signing and
   * encryption keys are made available, a `use` (Key Use) parameter value is REQUIRED for all keys
   * in the referenced JWK Set to indicate each key's intended usage. Although some algorithms
   * allow the same key to be used for both signatures and encryption, doing so is NOT RECOMMENDED,
   * as it is less secure. The JWK x5c parameter MAY be used to provide X.509 representations of
   * keys provided. When used, the bare key values MUST still be present and MUST match those in
   * the certificate.
   */
  jwks_uri: string;

  /**
   * URL of the Self-Issued OP used by the RP to perform Authentication of the End-User.
   * Can be custom URI scheme, or Universal Links/App links.
   */
  authorization_endpoint?: string;
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

export type IntentName = (typeof INTENTS_LIST)[number];

export type CheckResult =
  | {
      success: true;
    }
  | {
      success: false;
      errors: string[];
    };

/**
 * Types from Ledger API v3
 */
export interface BesuTransactionReceipt {
  status: string;
  revertReason: string;
}

/**
 * Types from TIR API v4
 */
type IssuerTypeName = (typeof ISSUER_TYPES)[number];

interface AttributeObject {
  hash: string;
  body: string;
  issuerType: IssuerTypeName;
  tao: string;
  rootTao: string;
}

export interface IssuerAttribute {
  did: string;
  attribute: AttributeObject;
}

export interface PaginatedList<T> {
  self: string;
  items: T[];
  total: number;
  pageSize: number;
  links: {
    first: string;
    prev: string;
    next: string;
    last: string;
  };
}

export interface IdLink {
  id: string;
  href: string;
}

export type HolderWalletCredentialType =
  (typeof HOLDER_WALLET_CREDENTIAL_TYPES)[number];


  export interface KnownIssuerMetadata {
   
    issuer_name: string;
    issuer_url: string;  
    supported_vc_type: string;
  
    };

    export type KnownIssuersMetadata = KnownIssuerMetadata[];
  
