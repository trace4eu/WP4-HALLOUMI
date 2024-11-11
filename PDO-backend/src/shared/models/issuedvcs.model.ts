import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { Document, Types } from 'mongoose';

export type IssuedVCDocument = IssuedVC & Document;

@Schema()
export class IssuedVC {
  _id!: Types.ObjectId;

  
  @Prop({required: true})
  authpin!: string;

  @Prop({required: true})
  actorDID!: string;

  
  @Prop({required: true})
  productName!: string;

  
  @Prop({required: true})
  legalName!: string;

  @Prop({required: true})
  allowedEvent!: string;
  
  @Prop({required: true})
  lastInChain!: boolean;


  @Prop({required: true })
  vcjwt!: string;


  @Prop({required: true})
  status!: string;

  @Prop({required: false})
  access_token!: string;

  @Prop({required: true})
  downloaded!: boolean;

  @Prop({required: true})
  issuedDate!: Date;
  
}

export const IssuedVCSchema = SchemaFactory.createForClass(IssuedVC);