import { Op, Sequelize } from "sequelize";
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  tags: Tag[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { name: {[Op.like]: `%${searchParam}%`} },
        { color: {[Op.like]: `%${searchParam}%`} }
      ]
    }
  }

  const { count, rows: tags } = await Tag.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    include: [{
      model: Ticket,
      as: 'tickets',
      attributes: [],
      required: false
    }],
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
    subQuery: false
  });
  const hasMore = count > offset + tags.length;

  return {
    tags,
    count,
    hasMore
  };
};

export default ListService;
