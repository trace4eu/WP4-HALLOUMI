import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  _id!: Types.ObjectId;

  @Prop({
    required: true,
    unique: false, 
  })
  nickname!: string;

  @Prop({
    required: true,
    maxlength: 40,
    minlength: 5,
    unique: true, 
  })
  email!: string;

  @Prop({required: true})
  password!: string;

  @Prop({required: false})
  loggedIn!: boolean;
 

  @Prop({required: true})
  verified!: boolean;
  
}

export const UserSchema = SchemaFactory.createForClass(User);