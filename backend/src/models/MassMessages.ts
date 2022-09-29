import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  AutoIncrement,
  BelongsTo
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";

@Table
class MassMessages extends Model<MassMessages> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  message: string;

  @Column
  phone: string;

  @Column
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp, "whatsappId")
  whatsapp: Whatsapp;
}

export default MassMessages;
