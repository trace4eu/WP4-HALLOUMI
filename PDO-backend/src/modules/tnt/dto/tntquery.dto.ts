import {   IsNotEmpty, IsOptional, IsString } from 'class-validator';




export class TnTqueryDto {

 
  @IsString()
  productName!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  actordid?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  allowedEvent?: string;

}

export default TnTqueryDto;