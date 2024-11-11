import { IsArray, IsHexadecimal, IsOptional, IsString } from "class-validator";
import type { JsonWebKey } from "node:crypto";

export class InitiateDto {
  @IsString()
  did!: string;

  @IsArray()
  keys!: Array<JsonWebKey>;

  @IsOptional()
  @IsString()
  attributeUrl!: string;

  @IsOptional()
  @IsHexadecimal()
  proxyId!: string;

  @IsOptional()
  @IsString()
  issuerState!: string;
}

export default InitiateDto;
