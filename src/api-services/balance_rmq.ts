import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class BalanceEventService {
  constructor(
    @Inject('Balance_Emit_MQ_SERVICE')
    private readonly balanceQueue: ClientProxy,
  ) {}
  checkBalance(body: {
    account: string;
    amount: number;
    currency: string;
  }): Promise<{ hasBalance: boolean }> {
    try {
      return this.balanceQueue.send<any>('check:balance', body).toPromise();
    } catch (error) {
      console.error('Error on check balance', error);
      throw error;
    }
  }
  async emitCreatedPayment(body: {
    accountFrom: string;
    amount: number;
    currency: string;
    accountTo: string;
  }) {
    try {
      this.balanceQueue.emit<any>('payment:created', body);
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
      this.balanceQueue.emit<any>('payment:deleted', body);
    } catch (error) {
      console.error('Error sending request', error);
      throw error;
    }
  }
}
