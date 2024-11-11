import {IsNotEmpty, IsString  } from "class-validator";

/**
 * DTO that validates only the redirect_uri parameter of the OpenID Connect Authentication Request
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
 */
export class GetAuthorizeDto {
  /**
   * REQUIRED. Redirection URI to which the response will be sent. This URI MUST exactly match one
   * of the Redirection URI values for the Client pre-registered at the OpenID Provider.
   */
  @IsString()
  @IsNotEmpty()
  redirect_uri!: string;
}

export default GetAuthorizeDto;
