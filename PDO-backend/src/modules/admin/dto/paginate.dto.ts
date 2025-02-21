import { IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";

const orderType = [
    'newest',
    'oldest',
    // other
  ]

export class paginateDto {

  
    @IsNotEmpty()
    @IsOptional()
    @IsNumberString()
    page?: string;
  
    @IsNotEmpty()
    @IsOptional()
    @IsNumberString()
    limit?: string;
  
  
    @IsNotEmpty()
    @IsOptional()
    productName?: string;
  
    @IsNotEmpty()
    @IsOptional()
    @IsEnum(orderType, {message: 'order must be newest or oldest'})
    order?: string;
   
  }

  export class paginateActorsDto {

    @IsString()
    productName!: string;
  
    @IsNotEmpty()
    @IsOptional()
    @IsNumberString()
    page?: string;
  
    @IsNotEmpty()
    @IsOptional()
    @IsNumberString()
    limit?: string;
  
  }

  export class ProductsDto {

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    productName?: string;
 
  
  
   
  }
  
  export default paginateDto;