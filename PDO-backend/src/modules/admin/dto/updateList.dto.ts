import { IsNumber, IsString, Max, Min } from "class-validator";

export class UpdateListDto {
  // @IsString()
  // did!: string;

  @IsString()
  id!: string;

  @IsNumber()
  position!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  value!: number;
}

export default UpdateListDto;
