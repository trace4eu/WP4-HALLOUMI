import {  IsBooleanString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import IsDid from './validators/IsDid.js';



export class getLicenseDto {

 
  @IsDid()
  walletDID?: string;

}

export default getLicenseDto;