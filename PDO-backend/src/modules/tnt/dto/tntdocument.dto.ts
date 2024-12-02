import {   IsNotEmpty, IsOptional, IsString } from 'class-validator';




export class TnTdocumentDto {

 
  @IsString()
  documentId!: string;

  
  @IsString()
  fromCustomer!: string;


}

export class TnTEventsDto {

 
  @IsString()
  documentId!: string;

 

}


export default TnTdocumentDto;