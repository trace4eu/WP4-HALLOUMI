import {IsNotEmpty, IsString  } from "class-validator";

/**
 * DTO that validates only the redirect_uri parameter of the OpenID Connect Authentication Request
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
 */
export class GetBeTokenDto {
 
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  codeverifier!: string;

  @IsString()
  @IsNotEmpty()
  streamid!: string;
}

export default GetBeTokenDto;
