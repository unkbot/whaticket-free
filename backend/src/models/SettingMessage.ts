import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  AutoIncrement
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";

@Table
class SettingMessage extends Model<SettingMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  contacts: boolean;

  @Column
  photo: boolean;

  @Column
  random: boolean;

  @Column
  limit: number;

  @Column
  minutes: number;

  @Column
  seconds: number;

  @Column
  sendToday: number;

  @Column
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;
}

export default SettingMessage;
