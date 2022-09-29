import { Sequelize } from "sequelize";
import MassMessages from "../../models/MassMessages";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  messages: MassMessages[];
  count: number;
  hasMore: boolean;
}

const ListMassMessageService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = {
    phone: Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("phone")),
      "LIKE",
      `%${searchParam.toLowerCase().trim()}%`
    )
  };
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await MassMessages.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["message", "ASC"]],
    include: [
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name"]
      }
    ]
  });

  const hasMore = count > offset + messages.length;

  return {
    messages,
    count,
    hasMore
  };
};

export default ListMassMessageService;
