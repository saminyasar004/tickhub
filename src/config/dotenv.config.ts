import { ConfigModule } from '@nestjs/config';
import dotenv from 'dotenv';
dotenv.config();

export const port: number = parseInt(process.env.PORT || '3000');
export const dbConnectionString: string =
  process.env.DB_CONNECTION_STRING || '';

export const configModule = ConfigModule.forRoot({
  isGlobal: true, // Make ConfigModule available globally
  envFilePath: '.env', // Path to .env file
});
