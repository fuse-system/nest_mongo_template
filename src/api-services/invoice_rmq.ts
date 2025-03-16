import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
interface IInvoice {
  amount_paid: number;
  total_amount: number;
  currency: string;
  _id: string;
}
@Injectable()
export class InvoiceEventService {
  constructor(
    @Inject('Invoice_Emit_MQ_SERVICE')
    private readonly invoiceQueue: ClientProxy,
  ) {}
  checkInvoice(body: { invoice: string }): Promise<{ invoice: IInvoice }> {
    try {
      return this.invoiceQueue.send<any>('fetch:invoice', body).toPromise();
    } catch (error) {
      console.error('Error on check balance', error);
      throw error;
    }
  }
  async emitCreatedPayment(body: { paid: number; invoice: string }) {
    try {
      this.invoiceQueue.emit<any>('payment:created', body);
    } catch (error) {
      console.error('Error sending request', error);
      throw error;
    }
  }
  async emitDeletedPayment(body: { paid: number; invoice: string }) {
    try {
      this.invoiceQueue.emit<any>('payment:deleted', body);
    } catch (error) {
      console.error('Error sending request', error);
      throw error;
    }
  }
}
