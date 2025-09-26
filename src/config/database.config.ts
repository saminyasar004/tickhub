import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import Ticket from '../model/ticket.model';
import { dbConnectionString } from './dotenv.config';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const sequelize = new Sequelize(
        configService.get('DB_CONNECTION_STRING') || dbConnectionString,
        {
          dialect: 'postgres',
          logging: false,
          pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
          models: [Ticket], // Explicitly list models (or use path if multiple models)
          // models: [path.resolve(__dirname, '../model')], // Uncomment if you have multiple models in the 'model' directory
        },
      );
      await initializeDatabase(sequelize); // Call your initialize function
      return sequelize;
    },
  },
];

export const initializeDatabase = async (sequelize: Sequelize) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Alter tables to match models
    console.log('Database synced successfully!'.green); // Note: .green requires a library like 'chalk'
  } catch (err: any) {
    console.error('Error initializing database: '.red, err.message); // Note: .red requires 'chalk'
  }
};
