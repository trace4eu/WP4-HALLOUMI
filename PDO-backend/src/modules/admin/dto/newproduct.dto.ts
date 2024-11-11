import { IsArray, IsNumber, IsObject, IsString, Max, Min, isObject } from "class-validator";


export class NewProductDto {
  // @IsString()
  // did!: string;

  @IsString()
  productName!: string;

  @IsArray()
  requiredEvents!: string[];

 @IsString()
  lastInChainEvent!: string;
}

export default NewProductDto;