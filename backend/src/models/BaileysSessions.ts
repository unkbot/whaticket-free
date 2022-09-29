import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default,
  ForeignKey
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";

@Table
class BaileysSessions extends Model<BaileysSessions> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default(null)
  @Column
  value: string;

  @Default(null)
  @Column
  name: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;
}

export default BaileysSessions;
