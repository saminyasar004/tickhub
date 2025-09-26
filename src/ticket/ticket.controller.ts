import { Controller, Get, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import Ticket from '../model/ticket.model';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  async scrapeAndGetTickets(
    @Query('search') searchQuery?: string,
  ): Promise<Ticket[]> {
    if (searchQuery) {
      return await this.ticketService.scrapeTickets(searchQuery);
    }
    return await this.ticketService.getAllTickets();
  }
}
