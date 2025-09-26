import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import Ticket from '../model/ticket.model';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  imports: [SequelizeModule.forFeature([Ticket])],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
