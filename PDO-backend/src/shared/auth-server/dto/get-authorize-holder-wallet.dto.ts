import { Equals, IsOptional, IsString } from "class-validator";
import { GetAuthorizeGenericDto } from "./get-authorize-generic.dto.js";

/**
 * User Authentication (e.g. Holder Wallet)
 * @see https://api-conformance.ebsi.eu/docs/specs/verifiable-credential-issuance-guidelines-v3#user-authentication
 */
export class GetAuthorizeHolderWallerDto extends  GetAuthorizeGenericDto {
  /**
   * Overwrites the defaults defined in the Holder Wallet Metadata.
   * The object structure matches the metadata structure.
   *
   * @see https://api-conformance.ebsi.eu/docs/specs/providers-and-wallets-metadata#holder-wallet-metadata
   */
  @IsOptional()
  @IsString()
  readonly client_metadata?: string; // Note: we validate the content of client_metadata with zod

  // PKCE

  /**
   * Format: BASE64URL-ENCODE(SHA256(code_verifier as UTF-8 string))
   * `code_verifier` is client generated secure random, which will be used with token endpoint.
   * It is between 43 and 128 characters long, and contains characters A-Z, a-z, 0-9, hyphen,
   * period, underscore, and tilde.
   */
  @IsOptional()
  @IsString()
  readonly code_challenge?: string;

  /**
   * If the client is capable of using "S256", it MUST use "S256". Else "plain" can only be used if
   * they cannot support "S256".
   */
  @IsOptional()
  @Equals("S256")
  readonly code_challenge_method?: "S256";

  @IsOptional()
  @IsString()
  readonly authorization_details!: string;

  /**
   * CONDITIONAL: REQUIRED if Credential Offering contained issuer_state.
   */
  @IsOptional()
  @IsString()
  readonly issuer_state?: string;
}

export default GetAuthorizeHolderWallerDto;
