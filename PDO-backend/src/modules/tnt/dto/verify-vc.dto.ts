import { IsNotEmpty } from "class-validator";

export class verifyVCDto {

  
    @IsNotEmpty()
    jwtvc!: string;

}