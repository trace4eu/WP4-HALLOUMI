import { Equals, IsJWT, IsUrl } from "class-validator";
import { PostTokenAuthorizationCodeDto } from "./post-token-authorization-code.dto.js";

/**
 * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
 * @see https://www.rfc-editor.org/rfc/rfc7521#section-4.2
 */
export class PostTokenClientAssertionDto extends PostTokenAuthorizationCodeDto {
  @IsUrl({
    // Allow "localhost"
    require_tld: false,
    // Allow custom protocols
    require_valid_protocol: false,
    // Protocol must be present
    require_protocol: true,
    // Allow underscore in host name
    allow_underscores: true,
  })
  declare readonly client_id: string;

  @Equals("urn:ietf:params:oauth:client-assertion-type:jwt-bearer")
  readonly client_assertion_type!: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

  @IsJWT()
  readonly client_assertion!: string;
}

export default PostTokenClientAssertionDto;
