import { Equals, IsIn, IsOptional, IsString, Matches } from "class-validator";
//import type { Scope } from "../interfaces";
import { IsDidOrUrl } from "./validators/IsDidOrUrl.js";
import { GetAuthorizeDto } from "./get-authorize.dto.js";
//import { PartialType } from "@nestjs/mapped-types";

/**
 * OpenID Connect Authentication Request
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
 */
export class GetAuthorizeGenericDto extends  GetAuthorizeDto {
  /**
   * REQUIRED. OpenID Connect requests MUST contain the openid scope value.
   * If the openid scope value is not present, the behavior is entirely unspecified.
   */
  @IsIn(["openid", "openid ver_test:id_token", "openid ver_test:vp_token"])
  readonly scope!: string;

  /**
   * REQUIRED. OAuth 2.0 Response Type value that determines the authorization processing flow to
   * be used, including what parameters are returned from the endpoints used. When using the
   * Authorization Code Flow, this value is code.
   *
   * MUST be 'code'
   */
  @Equals("code")
  readonly response_type!: string;

  /**
   * REQUIRED. OAuth 2.0 Client Identifier valid at the Authorization Server.
   * Verifiable Accreditation Issuance: MUST be URL of the issuer requesting the accreditation that
   * was registered with the Accreditation Issuer
   */
  @IsDidOrUrl()
  readonly client_id!: string;

  /**
   * RECOMMENDED. Opaque value used to maintain state between the request and the callback.
   * Typically, Cross-Site Request Forgery (CSRF, XSRF) mitigation is done by cryptographically
   * binding the value of this parameter with a browser cookie.
   */
  @IsOptional()
  @IsString()
  readonly state?: string;

  /**
   * OPTIONAL. String value used to associate a Client session with an ID Token, and to mitigate
   * replay attacks. The value is passed through unmodified from the Authentication Request to the
   * ID or VP Token. Sufficient entropy MUST be present in the nonce values used to prevent
   * attackers from guessing values.
   */
  @IsOptional()
  @IsString()
  readonly nonce?: string;

  // Undocumented query parameter (useful for testing purpose mainly)
  @IsOptional()
  @Matches(/^(value|reference)$/)
  readonly request_object?: "value" | "reference" = "value";
}

export default GetAuthorizeGenericDto;
