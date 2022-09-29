import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import { Sequelize } from "sequelize";
import Ticket from "../../models/Ticket";

const TagService = async (id: string | number): Promise<Tag> => {
  const tag = await Tag.findByPk(id, {
    attributes: {
      include: [[Sequelize.fn("COUNT", Sequelize.col("tickets.id")), "ticketsCount"]]
    },
    group: [
      "Tag.id",
      "tickets.TicketTag.tagId",
      "tickets.TicketTag.ticketId",
      "tickets.TicketTag.createdAt",
      "tickets.TicketTag.updatedAt",
    ],
    include: [
      {
        model: Ticket, as: "tickets", attributes: []
      },
    ]
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  return tag;
};

export default TagService;
