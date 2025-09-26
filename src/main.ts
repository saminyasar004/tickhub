import 'colors';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { initializeDatabase } from './config/database.config';
import { port } from './config/dotenv.config';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  // Enable CORS for all origins
  app.enableCors({
    origin: '*', // Allow all origins (for development/LAN)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allowed methods
    credentials: true, // Allow cookies/auth headers (if needed)
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/',
  });

  // Retrieve the Sequelize instance from the DI container
  const sequelize = app.get<Sequelize>('SEQUELIZE');

  await app.listen(port ?? 3000, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`.green);
    initializeDatabase(sequelize);
  });
}
bootstrap();
