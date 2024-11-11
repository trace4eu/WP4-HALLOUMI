import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { Document, Types } from 'mongoose';

export type VerTokenDocument = VerToken & Document;

@Schema()
export class VerToken {
  _id!: Types.ObjectId;

  @Prop({
    required: true,
    unique: true, 
    ref: "user"
  })
  userid!: Types.ObjectId;

  @Prop({
    required: true,
  })
  vertoken!: string;

  @Prop({
    default: Date.now,//new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000),
    expires: 300, //secs
  })
  createdAt!: Date;
  
}

export const VerTokenSchema = SchemaFactory.createForClass(VerToken);