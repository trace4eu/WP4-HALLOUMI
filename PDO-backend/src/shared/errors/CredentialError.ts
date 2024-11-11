import {
  OAuth2Error,
  OAuth2ErrorCode,
  OAuth2ErrorOptions,
} from "./OAuth2Error.js";

/**
 * Credential Error
 * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#section-7.3.1
 */
export type CredentialErrorCode =
  | OAuth2ErrorCode
  /**
   * Credential Request contains the wrong Access Token or the Access Token is missing.
   */
  | "invalid_token"
  /**
   * Requested credential type is not supported
   */
  | "unsupported_credential_type"
  /**
   * Requested credential format is not supported
   */
  | "unsupported_credential_format"
  /**
   * Credential Request did not contain a proof, or proof was invalid, i.e. it was not bound to a
   * Credential Issuer provided nonce
   */
  | "invalid_or_missing_proof";

export class CredentialError extends OAuth2Error<CredentialErrorCode> {
  constructor(errorCode: CredentialErrorCode, options?: OAuth2ErrorOptions) {
    super(errorCode, options);
    this.name = "CredentialError";
  }
}

export default CredentialErrorCode;
