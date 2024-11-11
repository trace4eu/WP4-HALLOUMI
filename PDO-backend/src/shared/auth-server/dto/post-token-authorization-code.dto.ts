import { Equals, IsString } from "class-validator";
import { PostTokenDto } from "./post-token.dto.js";

/**
 * Authorization Code DTO for Token endpoint (without client_assertion / PKCE)
 *
 * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
 * @see https://www.rfc-editor.org/rfc/rfc7521#section-4.2
 */
export class PostTokenAuthorizationCodeDto extends PostTokenDto {
  @Equals("authorization_code")
  declare readonly grant_type: "authorization_code";

  @IsString()
  readonly code!: string;

  @IsString()
  readonly client_id!: string;
}

export default PostTokenAuthorizationCodeDto;
