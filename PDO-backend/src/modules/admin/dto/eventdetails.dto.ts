import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNumber, IsObject, IsString, Max, Min, ValidateNested, isObject } from "class-validator";



class EventDetails {
  @IsString()
  type!: string;
  @IsArray()
  details!: string[];

}

export class EventDetailsDto {
  // @IsString()
  // did!: string;

  @IsString()
  productName!: string;
  
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EventDetails)
  eventsDetails!: EventDetails[];


}

export default EventDetailsDto;