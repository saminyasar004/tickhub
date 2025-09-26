import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dbConnectionString } from './config/dotenv.config';
import { databaseProviders } from './config/database.config';
import Ticket from './model/ticket.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const sequelize = await databaseProviders[0].useFactory(configService);
        return {
          dialect: 'postgres',
          uri: configService.get('DB_CONNECTION_STRING') || dbConnectionString,
          models: [Ticket], // Explicitly list model classes
          autoLoadModels: true,
          synchronize: true, // Dev only; use migrations in production
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders, SequelizeModule],
})
export class DatabaseModule {}
