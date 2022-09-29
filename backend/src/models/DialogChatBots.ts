import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Chatbot from "./Chatbot";
import Contact from "./Contact";
import Queue from "./Queue";

@Table
class DialogChatBots extends Model<DialogChatBots> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  awaiting: number;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @ForeignKey(() => Chatbot)
  @Column
  chatbotId: number;

  @BelongsTo(() => Chatbot)
  chatbots: Chatbot;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default DialogChatBots;
