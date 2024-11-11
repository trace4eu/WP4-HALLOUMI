import {   IsString } from 'class-validator';




export class availActorsDto {

 
  @IsString()
  productName!: string;

}

export default availActorsDto;