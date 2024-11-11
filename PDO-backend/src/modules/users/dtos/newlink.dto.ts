//import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsString  } from "class-validator";

export class NewLinkDto {
 

 @IsString()
 @IsNotEmpty() 
 email!: string;

}

