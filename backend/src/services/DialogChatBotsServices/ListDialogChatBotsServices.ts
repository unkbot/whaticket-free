import { Op } from "sequelize";
import DialogChatBots from "../../models/DialogChatBots";

const ListDialogChatBotsServices = async (): Promise<DialogChatBots[]> => {
  const chatBot = await DialogChatBots.findAll({
    where: {
      queueId: {
        [Op.or]: [null]
      }
    },
    order: [["name", "ASC"]]
  });

  return chatBot;
};

export default ListDialogChatBotsServices;
