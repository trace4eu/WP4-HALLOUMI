import { IsIn } from "class-validator";

/**
 * Generic DTO for Token endpoint
 *
 * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
 */
export class PostTokenDto {
  @IsIn([
    "authorization_code",
    "urn:ietf:params:oauth:grant-type:pre-authorized_code",
  ])
  readonly grant_type!:
    | "authorization_code"
    | "urn:ietf:params:oauth:grant-type:pre-authorized_code";
}

export default PostTokenDto;
