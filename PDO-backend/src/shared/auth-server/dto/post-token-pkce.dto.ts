import { IsOptional, IsString } from "class-validator";
import { IsKeyDid } from "./validators/IsKeyDid.js";
import { PostTokenAuthorizationCodeDto } from "./post-token-authorization-code.dto.js";

/**
 * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
 * @see https://www.rfc-editor.org/rfc/rfc7521#section-4.2
 */
export class PostTokenPkceDto extends PostTokenAuthorizationCodeDto {
  @IsKeyDid()
  declare readonly client_id: string;

  @IsString()
  readonly code_verifier!: string;

  // @IsOptional()
  // @IsString()
  // readonly user_challenge?: string;
}

export default PostTokenPkceDto;
