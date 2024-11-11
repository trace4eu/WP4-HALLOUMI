import { IsNotEmpty } from "class-validator";

export class deleteForDto {

  
    @IsNotEmpty()
    walletDID!: string;

    @IsNotEmpty()
    sharedFor!: string;

    @IsNotEmpty()
    type!: string;

    @IsNotEmpty()
    vcid!: string;
}