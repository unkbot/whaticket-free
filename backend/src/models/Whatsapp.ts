import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  HasMany,
  Unique,
  BelongsToMany
} from "sequelize-typescript";
import Queue from "./Queue";
import Ticket from "./Ticket";
import WhatsappQueue from "./WhatsappQueue";

@Table
class Whatsapp extends Model<Whatsapp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull
  @Unique
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  session: string;

  @Column(DataType.TEXT)
  qrcode: string;

  @Column
  status: string;

  @Column
  battery: string;

  @Column
  plugged: boolean;

  @Column
  retries: number;

  @Column(DataType.TEXT)
  greetingMessage: string;

  @Column(DataType.TEXT)
  farewellMessage: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isMultidevice: boolean;

  @Default(false)
  @AllowNull
  @Column
  isDefault: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsToMany(() => Queue, () => WhatsappQueue)
  queues: Array<Queue & { WhatsappQueue: WhatsappQueue }>;

  @HasMany(() => WhatsappQueue)
  whatsappQueues: WhatsappQueue[];

  @Column(DataType.TEXT)
  transferTicketMessage: string;

  @Column
  startWorkHour: string;

  @Column
  endWorkHour: string;

  @AllowNull
  @Column(DataType.TEXT)
  startWorkHourWeekend: string;

  @AllowNull
  @Column
  endWorkHourWeekend: string;

  @Column
  defineWorkHours: string;

  @Column
  monday: boolean;

  @Column
  tuesday: boolean;

  @Column
  wednesday: boolean;

  @Column
  thursday: boolean;

  @Column
  friday: boolean;

  @Column
  saturday: boolean;

  @Column
  sunday: boolean;

  @Column(DataType.TEXT)
  outOfWorkMessage: string;
}

export default Whatsapp;
