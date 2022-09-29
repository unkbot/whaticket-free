import { Op } from "sequelize";
import Chatbot from "../../models/Chatbot";

const ListChatBotService = async (): Promise<Chatbot[]> => {
  const chatBot = await Chatbot.findAll({
    where: {
      queueId: {
        [Op.or]: [null]
      }
    },
    order: [["id", "ASC"]]
  });

  return chatBot;
};

export default ListChatBotService;
