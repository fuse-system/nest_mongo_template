import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { CreatePaymentDto } from 'src/dtos/create.payment.dto';
import { UpdatePaymentDto } from 'src/dtos/update.payment.dto';
import { PaymentQueryDto } from 'src/dtos/payment.query.dto';
import { PaymentService } from 'src/services/payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() body: CreatePaymentDto) {
    return this.paymentService.createPayment(body);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.paymentService.getOne(id);
  }

  @Get()
  async getAll(@Query() query: PaymentQueryDto) {
    return this.paymentService.getAll(query);
  }

  @Patch(':id')
  async updatePayment(@Param('id') id: string, @Body() body: UpdatePaymentDto) {
    return this.paymentService.updatePayment(id, body);
  }

  @Delete(':id')
  async deletePayment(@Param('id') id: string) {
    return this.paymentService.deletePayment(id);
  }
}
