import {   IsNotEmpty, IsOptional, IsString } from 'class-validator';




export class TnTdocumentDto {

 
  @IsString()
  documentId!: string;

  
  @IsString()
  fromCustomer!: string;


}

export default TnTdocumentDto;