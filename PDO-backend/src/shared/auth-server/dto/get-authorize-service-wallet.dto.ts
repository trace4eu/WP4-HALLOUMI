import { IsJWT, IsOptional, IsUrl } from "class-validator";
import { GetAuthorizeGenericDto } from "./get-authorize-generic.dto.js";

/**
 * Client Authentication (e.g. Service Wallet)
 * @see https://api-conformance.ebsi.eu/docs/specs/verifiable-credential-issuance-guidelines-v3#client-authentication
 */
export class GetAuthorizeServiceWalletDto extends GetAuthorizeGenericDto {
  @IsOptional()
  @IsJWT()
  readonly request?: string;

  @IsOptional()
  @IsUrl()
  readonly request_uri?: string;
}

export default GetAuthorizeServiceWalletDto;
