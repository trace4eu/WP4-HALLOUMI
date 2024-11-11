//import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsOptional, IsString  } from "class-validator";

export class UAuthDto {
 // @ApiProperty()
 @IsString()
 @IsOptional()
 nickname!: string;

 @IsString()
 @IsNotEmpty() 
 email!: string;

 // @ApiProperty()
 @IsString()
 @IsNotEmpty() 
  password!: string;
}


export const responseLoginSchema = {
    schema: {
        type: 'object',
        properties: {
            message: {
                type: 'string'
                },
            token: {
                type: 'string'
            }
        }
    }
}