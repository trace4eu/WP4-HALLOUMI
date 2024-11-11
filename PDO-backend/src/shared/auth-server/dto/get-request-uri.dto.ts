import { IsOptional, IsString, IsUUID } from "class-validator";

export class GetRequestUriDto {
  @IsUUID("4")
  requestId!: string;

  @IsString()
  @IsOptional()
  did!: string;
}

export default GetRequestUriDto;
