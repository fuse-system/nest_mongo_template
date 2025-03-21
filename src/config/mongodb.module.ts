import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class MongodbModule {
  static forRoot(): DynamicModule {
    const mongooseConnectionOptions = {
      family: undefined,
      hints: undefined,
      localAddress: undefined,
      localPort: undefined,
      lookup: undefined,
    };

    const encodedPassword = encodeURIComponent(process.env.DB_PASSWORD);
    const uri =
      process.env.DB_MONGODB_URI ||
      `mongodb+srv://${process.env.DB_USERNAME}:${encodedPassword}@${
        process.env.DB_HOST
      }/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=${
        process.env.DB_APP_NAME || 'Cluster0'
      }`;

    return {
      module: MongodbModule,
      imports: [MongooseModule.forRoot(uri, mongooseConnectionOptions)],
    };
  }
}
