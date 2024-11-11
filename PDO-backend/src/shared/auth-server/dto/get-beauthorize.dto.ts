import {IsNotEmpty, IsString  } from "class-validator";

/**
 * DTO that validates only the redirect_uri parameter of the OpenID Connect Authentication Request
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
 */
export class GetBeAuthDto {
 
  @IsString()
  @IsNotEmpty()
  userid!: string;


  @IsString()
  @IsNotEmpty()
  be_secret!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;
}

export default GetBeAuthDto;
