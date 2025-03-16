import { IsOptional, IsString } from 'class-validator';

export class UpdatePaymentDto {
  @IsString()
  paymentMethod: string;

  @IsOptional()
  transactionDate?: Date;

  @IsOptional()
  @IsString()
  description?: string;
}
