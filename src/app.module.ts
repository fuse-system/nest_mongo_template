import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { MongodbModule } from './config/mongodb.module';
import { HttpModule } from '@nestjs/axios';
import { CheckHeaderMiddleware } from './core/platform-key-middleware/check-header.middleware';
import { JwtStrategy } from './core/jwt-auth-guard/jwt.strategy';
import { RabbitMqConfigModule } from './config/rabbitmq-config.module';
import { APP_FILTER } from '@nestjs/core';
import { CatchAppExceptionsFilter } from './core/error-handling/error.filter';
import { JwtModule } from '@nestjs/jwt';
import { JournalEventService } from './api-services/journal_rmq';
import { BalanceEventService } from './api-services/balance_rmq';
import { InvoiceEventService } from './api-services/invoice_rmq';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '50d' },
    }),
    MongodbModule.forRoot(),
    HttpModule,
    RabbitMqConfigModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    JournalEventService,
    BalanceEventService,
    InvoiceEventService,
    { provide: APP_FILTER, useClass: CatchAppExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  // MiddlewareConsumer is used to configure the middleware vvv
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckHeaderMiddleware /* , otherMiddleWare */)
      .forRoutes(
        { path: '*', method: RequestMethod.ALL } /* OR AppController */,
      );
  }
}
