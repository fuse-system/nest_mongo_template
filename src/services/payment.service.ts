import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BalanceEventService } from 'src/api-services/balance_rmq';
import { InvoiceEventService } from 'src/api-services/invoice_rmq';
import { JournalEventService } from 'src/api-services/journal_rmq';
import { ApiService } from 'src/core/api/api.service';
import { CreatePaymentDto } from 'src/dtos/create.payment.dto';
import { PaymentQueryDto } from 'src/dtos/payment.query.dto';
import { UpdatePaymentDto } from 'src/dtos/update.payment.dto';
import { Payment } from 'src/models/payment.model';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    private apiService: ApiService<Payment, PaymentQueryDto>,
    private invoiceEventService: InvoiceEventService,
    private balanceEventService: BalanceEventService,
    private journalEventService: JournalEventService,
  ) {}
  async createPayment(body: CreatePaymentDto) {
    const { invoice } = await this.invoiceEventService.checkInvoice({
      invoice: body.invoice,
    });
    const remaining = invoice.total_amount - invoice.amount_paid;
    if (invoice.currency != body.currency) {
      throw new NotFoundException(`Invoice currency is ${invoice.currency}`);
    }
    if (body.amount > remaining) {
      throw new NotFoundException(`Invoice remaining amount is ${remaining}`);
    }
    const { hasBalance } = await this.balanceEventService.checkBalance({
      amount: body.amount,
      currency: body.currency,
      account: body.accountFrom,
    });
    if (!hasBalance) {
      throw new NotFoundException(
        `Insufficient balance in account ${body.accountFrom}`,
      );
    }
    const payment = await this.paymentModel.create(body);
    const totalPaid = await this.aggregateInvoice(body.invoice);
    this.balanceEventService.emitCreatedPayment({
      accountFrom: body.accountFrom,
      amount: body.amount,
      currency: body.currency,
      accountTo: body.accountTo,
    });
    this.journalEventService.emitCreatedPayment({
      accountFrom: body.accountFrom,
      amount: body.amount,
      currency: body.currency,
      accountTo: body.accountTo,
    });
    this.invoiceEventService.emitCreatedPayment({
      invoice: body.invoice,
      paid: totalPaid,
    });
    return payment;
  }
  async deletePayment(id: string) {
    const payment = await this.paymentModel.findById(id);
    const totalPaid = await this.aggregateInvoice(payment.invoice);
    this.balanceEventService.emitDeletedPayment({
      accountFrom: payment.accountFrom,
      amount: payment.amount,
      currency: payment.currency,
      accountTo: payment.accountTo,
    });
    this.journalEventService.emitCreatedPayment({
      accountFrom: payment.accountFrom,
      amount: payment.amount,
      currency: payment.currency,
      accountTo: payment.accountTo,
    });
    this.invoiceEventService.emitCreatedPayment({
      invoice: payment.invoice,
      paid: totalPaid,
    });
    await payment.deleteOne();
    return `payment deleted successfully`;
  }
  async aggregateInvoice(invoiceId: string) {
    const invoices = await this.paymentModel.aggregate([
      {
        $match: { invoice: invoiceId },
      },
      {
        $group: {
          _id: '$invoice',
          totalAmount: { $sum: '$amount' }, // Sum of all amounts
        },
      },
    ]);
    let totalPaid = 0;
    if (invoices.length > 0) {
      totalPaid = invoices[0].totalAmount ?? 0;
    }
    return totalPaid;
  }
  async getOne(id: string) {
    const payment = await this.paymentModel.findById(id);
    if (!payment) {
      throw new NotFoundException('item not found');
    }
    return payment;
  }
  async getAll(obj: PaymentQueryDto) {
    const { paginationObj, query } = await this.apiService.getAllDocs(
      this.paymentModel.find(),
      obj,
    );
    const data = await query;
    return { data, metadata: paginationObj };
  }
  async updatePayment(id: string, body: UpdatePaymentDto) {
    const payment = await this.paymentModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
