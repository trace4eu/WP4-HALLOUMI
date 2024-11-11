import { ArrayNotEmpty, IsArray, IsJSON, IsJWT,  IsObject,  IsString,  MaxLength,  MinLength, ValidateNested } from "class-validator";



export class UpdateBatchDto {
  // @IsString()
  // did!: string;


  @IsString()
  @MinLength(66)
  @MaxLength(66)
  documentId!: string;

  @IsObject()
  eventDetails!: object;

 @IsJWT()
  vp_token!: string;

  @IsObject()
  presentation_submission!: string;
}

export default UpdateBatchDto;