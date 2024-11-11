import { IsEnum, IsNotEmpty,  IsOptional,  IsString } from "class-validator";
import IsDid from '../../tnt/dto/validators/IsDid.js';

const pinType = [
  'onboard',
  'accrTAO',
  'accrTI',
  // other
]

export class issueVCDto {
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @IsDid()
  actorDID!: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsEnum(pinType, {message: 'type must be onboard or accrTI or accrTAO'})
  // type!: string;

  @IsString()
  @IsNotEmpty()
  legalName!: string;

  
  @IsString()
  @IsNotEmpty()
  allowedEvent!: string;

   
  // @IsString()
  // @IsNotEmpty()
  // lastInChain!: boolean;
 
}

export default issueVCDto;
