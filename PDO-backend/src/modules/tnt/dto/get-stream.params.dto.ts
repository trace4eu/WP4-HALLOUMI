import { IsUUID } from "class-validator";

export class GetStreamParamsDto {
  @IsUUID("4")
  streamId!: string;
}

export default GetStreamParamsDto;