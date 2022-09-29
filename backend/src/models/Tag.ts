import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsToMany
} from "sequelize-typescript";
import Ticket from "./Ticket";
import TicketTag from "./TicketTag";

@Table
class Tag extends Model<Tag> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  color: string;

  @BelongsToMany(() => Ticket, () => TicketTag)
  tickets: Ticket[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Tag;
