import { IsOptional } from 'class-validator';

export class PaymentQueryDto {
  @IsOptional()
  page: string;
  @IsOptional()
  limit: string;
  @IsOptional()
  invoice: string;
}
