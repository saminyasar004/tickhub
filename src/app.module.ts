import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketModule } from './ticket/ticket.module';
import { configModule } from './config/dotenv.config';
import { DatabaseModule } from './database.module';

@Module({
  imports: [configModule, DatabaseModule, TicketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
