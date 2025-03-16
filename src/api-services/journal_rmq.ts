import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class JournalEventService {
  constructor(
    @Inject('Journal_Emit_MQ_SERVICE')
    private readonly journalQueue: ClientProxy,
  ) {}
  async emitCreatedPayment(body: {
    accountFrom: string;
    amount: number;
    currency: string;
    accountTo: string;
  }) {
    try {
      this.journalQueue.emit<any>('payment:created', body);
    } catch (error) {
      console.error('Error sending request', error);
      throw error;
    }
  }
  async emitDeletedPayment(body: {
    accountFrom: string;
    amount: number;
    currency: string;
    accountTo: string;
  }) {
    try {
      this.journalQueue.emit<any>('payment:deleted', body);
    } catch (error) {
      console.error('Error sending request', error);
      throw error;
    }
  }
}
