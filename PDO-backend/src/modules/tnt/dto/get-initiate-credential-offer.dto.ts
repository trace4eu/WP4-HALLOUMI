import { IsIn, IsOptional, IsString, Matches } from "class-validator";
import { IsDid } from "./validators/index.js";
import { HOLDER_WALLET_CREDENTIAL_TYPES } from "../../../shared/constants.js";
import type { HolderWalletCredentialType } from "../../../shared/interfaces.js";

export class GetInitiateCredentialOfferDto {
  @IsIn(HOLDER_WALLET_CREDENTIAL_TYPES)
  credential_type!: HolderWalletCredentialType;

  /**
   * credential_offer_endpoint: OPTIONAL. URL of the Credential Offer Endpoint of a Wallet.
   *
   * @see https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-11.html#name-client-metadata
   */
  @IsOptional()
  @Matches(/^[a-z][a-z0-9+\-.]*:[a-z0-9+\-./@:_]*$$/, {
    message: "credential_offer_endpoint must be a valid endpoint",
  })
  credential_offer_endpoint = "openid-credential-offer://";

  @IsDid()
  client_id!: string;

  // "redirect" is only used with "CTWalletQualificationCredential"
  @IsOptional()
  @IsString()
  redirect?: string;
}

export default GetInitiateCredentialOfferDto;
