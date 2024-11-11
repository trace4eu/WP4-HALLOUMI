import { IsUUID } from "class-validator";

export class GetCredentialOfferParamsDto {
  @IsUUID("4")
  credentialOfferId!: string;
}

export default GetCredentialOfferParamsDto;