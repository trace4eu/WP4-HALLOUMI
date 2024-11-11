import { IsNumber, IsString, Max, Min } from "class-validator";

export class RevokeDto {
  // @IsString()
  // did!: string;

  @IsString()
  walletdid!: string;

 
}

export default RevokeDto;
