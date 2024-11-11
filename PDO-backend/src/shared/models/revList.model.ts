import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { Document, Types } from 'mongoose';


export type RevListDocument = RevList & Document;

@Schema()
export class RevList {
  _id!: Types.ObjectId;

  @Prop({required: true})
  did!:string;

  @Prop({required: false, unique: true })
  statusList2021Id!: string;

  @Prop({required: false})
  encodedList!: string;

  @Prop({required: true})
  proxyidrec!: boolean;

  @Prop({required: false})
  proxyid!: string;

  
}

export const RevListSchema = SchemaFactory.createForClass(RevList);