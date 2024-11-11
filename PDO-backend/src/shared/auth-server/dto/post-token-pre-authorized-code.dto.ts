import { Equals, /*IsJWT,*/ IsString } from "class-validator";
import { PostTokenDto } from "./post-token.dto.js";

/**
 * Pre-Authorized code DTO for Token endpoint
 *
 * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#name-token-request
 */
export class PostTokenPreAuthorizedCodeDto extends PostTokenDto {
  @Equals("urn:ietf:params:oauth:grant-type:pre-authorized_code")
  declare readonly grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code";

 // @IsJWT()
  @IsString()
  readonly "pre-authorized_code"!: string;

  @IsString()
  readonly user_pin!: string;
}

export default PostTokenPreAuthorizedCodeDto;
