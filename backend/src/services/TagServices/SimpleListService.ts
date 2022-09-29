import { Op, Sequelize } from "sequelize";
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";

interface Request {
  searchParam?: string;
}

const ListService = async ({
  searchParam
}: Request): Promise<Tag[]> => {
  let whereCondition = {};

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { name: {[Op.like]: `%${searchParam}%`} },
        { color: {[Op.like]: `%${searchParam}%`} }
      ]
    }
  }

  const tags = await Tag.findAll({
    where: whereCondition,
    order: [["name", "ASC"]],
    include: [{
      model: Ticket,
      as: 'tickets',
    }],
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
      include: [[Sequelize.fn("COUNT", Sequelize.col("tickets.id")), "ticketsCount"]]
    },
    group: [
      "Tag.id",
      "tickets.TicketTag.tagId",
      "tickets.TicketTag.ticketId",
      "tickets.TicketTag.createdAt",
      "tickets.TicketTag.updatedAt",
      "tickets.id"
    ]
  });

  return tags;
};

export default ListService;
