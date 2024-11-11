import { ArrayNotEmpty, IsArray, IsJSON, IsJWT,  IsObject,  IsString,  MinLength, ValidateNested } from "class-validator";


import { Type } from "class-transformer";
import IsDid from "./validators/IsDid.js";

class RequiredAction {
  @IsString()
  type!: string;
  @IsDid()
  from!: string;
  @IsString()
  fromName!: string;
  @IsString()
  notesToActor!: string
}

export class NewBatchDto {
  // @IsString()
  // did!: string;

  @IsString()
  productName!: string;

  @IsString()
  @MinLength(8)
  batchId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RequiredAction)
  requiredActions!: RequiredAction[];

 @IsJWT()
  vp_token!: string;

  @IsObject()
  presentation_submission!: string;
}

export default NewBatchDto;