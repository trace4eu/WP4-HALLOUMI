import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

type EventDetails = {
  type: string;
  details: string[]
}

@Schema()
export class Product {
  _id!: Types.ObjectId;

  @Prop({
    required: true,
    unique: true, 
   
  })
  productName!: string;

  @Prop({
    required: true,
  })
  requiredEvents!: [type:string];

  @Prop({
    required: false,
  })
  eventsDetails!: [type:EventDetails];

  @Prop({
    required: true,
  })
  lastInChainEvent!: string;

  
}

export const ProductSchema = SchemaFactory.createForClass(Product);