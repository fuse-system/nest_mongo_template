import { Global, INestApplication, Module } from '@nestjs/common';
import {
  ClientProviderOptions,
  ClientsModule,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
function registerMicroservice(
  ProviderName: string,
  rabbitmqQueueName: string,
): ClientProviderOptions {
  return {
    name: ProviderName,
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: rabbitmqQueueName,
      queueOptions: {
        durable: false,
      },
      maxConnectionAttempts: 5,
      socketOptions: {
        reconnectTimeInSeconds: 5,
      },
    },
  };
}
@Global()
@Module({
  imports: [
    ClientsModule.register([
      registerMicroservice('Balance_Emit_MQ_SERVICE', 'payment.to.balance'),
      registerMicroservice('Invoice_Emit_MQ_SERVICE', 'payment.to.invoice'),
      registerMicroservice('Journal_Emit_MQ_SERVICE', 'payment.to.journal'),
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMqConfigModule {
  static async setup(app: INestApplication<any>) {
    const listenToMicroservice = (rabbitmqQueueName: string) => {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: rabbitmqQueueName,
          queueOptions: {
            durable: false,
          },
        },
      });
    };
    listenToMicroservice('balance.to.payment');
    await app.startAllMicroservices();
  }
}
