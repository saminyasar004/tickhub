import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

export interface TicketAttributes {
  id: number;
  eventName: string;
  venue: string;
  date: string;
  price: number;
  section: string;
  quantity: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TicketCreationAttributes {
  eventName: string;
  venue: string;
  date: string;
  price: number;
  section: string;
  quantity: string;
  url: string;
}

@Table({
  tableName: 'tickets',
  timestamps: true,
})
export default class Ticket extends Model<
  TicketAttributes,
  TicketCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.STRING)
  declare eventName: string;

  @Column(DataType.STRING)
  declare venue: string;

  @Column(DataType.STRING)
  declare date: string;

  @Column(DataType.FLOAT)
  declare price: number;

  @Column(DataType.STRING)
  declare section: string;

  @Column(DataType.STRING)
  declare quantity: string;

  @Column(DataType.STRING)
  declare url: string;
}
