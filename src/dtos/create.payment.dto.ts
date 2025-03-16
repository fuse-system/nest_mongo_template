import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  user: string;

  @IsMongoId()
  invoice: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  transactionDate?: Date;

  @IsMongoId()
  accountFrom: string;

  @IsMongoId()
  accountTo: string;

  @IsOptional()
  @IsString()
  description?: string;
}
