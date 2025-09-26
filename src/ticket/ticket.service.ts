import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectModel } from '@nestjs/sequelize';
import { ElementHandle } from 'puppeteer';
import Ticket from '../model/ticket.model';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket)
    private ticketModel: typeof Ticket,
  ) {}

  // Helper function to replace waitForTimeout
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async scrapeTickets(searchQuery: string, retries = 2): Promise<Ticket[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );

    try {
      const searchUrl = `https://www.stubhub.com/search?q=${encodeURIComponent(searchQuery)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(2000); // Wait for dynamic content

      // Try primary selector, fall back to alternatives
      const selectors = [
        '.EventCard-module__container', // Original selector
        '[data-testid="event-card"]', // Fallback (inspect page for exact data-testid)
        '.event-card', // Generic fallback (update based on inspection)
      ];

      let ticketElements: ElementHandle<Element>[] | null = null;
      let selectedSelector: string | null = null;
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 15000 });
          ticketElements = await page.$$(selector);
          if (ticketElements.length > 0) {
            selectedSelector = selector;
            console.log(`Using selector: ${selector}`);
            break;
          }
        } catch (err) {
          console.log(`Selector ${selector} not found, trying next...`);
        }
      }

      if (!ticketElements || ticketElements.length === 0) {
        const pageContent = await page.content();
        console.error(
          'No ticket elements found. Page content:',
          pageContent.substring(0, 500),
        );
        throw new Error('No valid ticket selectors found on page');
      }

      const tickets = await page.evaluate((sel: string) => {
        const cards = document.querySelectorAll(sel);
        return Array.from(cards)
          .map((card) => {
            const nameEl = (card.querySelector('[data-testid="event-title"]') ||
              card.querySelector('.event-title')) as HTMLElement;
            const venueEl = (card.querySelector('[data-testid="venue-name"]') ||
              card.querySelector('.venue-name')) as HTMLElement;
            const dateEl = (card.querySelector('[data-testid="event-date"]') ||
              card.querySelector('.event-date')) as HTMLElement;
            const priceEl = (card.querySelector('.PriceText-module__price') ||
              card.querySelector('.price')) as HTMLElement;
            const sectionEl = (card.querySelector(
              '.SectionInfo-module__section',
            ) || card.querySelector('.section')) as HTMLElement;
            const qtyEl = (card.querySelector('.Quantity-module__quantity') ||
              card.querySelector('.quantity')) as HTMLElement;
            const linkEl = card.querySelector('a') as HTMLAnchorElement;

            return {
              eventName: nameEl?.textContent?.trim() || 'N/A',
              venue: venueEl?.textContent?.trim() || 'N/A',
              date: dateEl?.textContent?.trim() || 'N/A',
              price: parseFloat(
                priceEl?.textContent?.replace('$', '')?.replace(',', '') || '0',
              ),
              section: sectionEl?.textContent?.trim() || 'N/A',
              quantity: qtyEl?.textContent?.trim() || 'N/A',
              url: linkEl?.href || 'N/A',
            };
          })
          .filter((t) => t.eventName !== 'N/A');
      }, selectedSelector!); // Non-null assertion since we check ticketElements

      const savedTickets = await Promise.all(
        tickets.map(async (ticketData) => {
          const ticket = new this.ticketModel();
          ticket.eventName = ticketData.eventName;
          ticket.venue = ticketData.venue;
          ticket.date = ticketData.date;
          ticket.price = ticketData.price;
          ticket.section = ticketData.section;
          ticket.quantity = ticketData.quantity;
          ticket.url = ticketData.url;
          return await ticket.save();
        }),
      );

      await browser.close();
      return savedTickets;
    } catch (error) {
      await browser.close();
      if (retries > 0) {
        console.log(`Retrying scrape (${retries} attempts left)...`);
        return this.scrapeTickets(searchQuery, retries - 1);
      }
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }

  async getAllTickets(): Promise<Ticket[]> {
    return await this.ticketModel.findAll();
  }
}
