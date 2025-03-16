import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: String })
  user: string;

  @Prop({ type: String })
  invoice: string;

  @Prop({})
  amount: number;

  @Prop({})
  currency: string;

  @Prop({})
  paymentMethod: string;

  @Prop({ default: Date.now() })
  transactionDate: Date;

  @Prop({ type: String })
  accountFrom: string;

  @Prop({ type: String })
  accountTo: string;

  @Prop()
  description?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
