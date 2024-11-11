import { IsNumber, IsString, Max, Min } from "class-validator";

export class RevokeAccDto {
  // @IsString()
  // did!: string;

  @IsString()
  titaodid!: string;

 
}

export default RevokeAccDto;
