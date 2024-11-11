import { IsUUID } from "class-validator";

export class GetVerifyParamsDto {
  
  id!: string;
  vertoken!:string;
}

export default GetVerifyParamsDto;