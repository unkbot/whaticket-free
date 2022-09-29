import AppError from "../../errors/AppError";
import Chatbot from "../../models/Chatbot";

const ShowChatBotServices = async (id: number | string): Promise<Chatbot> => {
  const queue = await Chatbot.findOne({
    where: {
      id
    },
    order: [
      [{ model: Chatbot, as: "mainChatbot" }, "id", "ASC"],
      [{ model: Chatbot, as: "options" }, "id", "ASC"],
      ["id", "asc"]
    ],
    include: [
      {
        model: Chatbot,
        as: "mainChatbot"
      },
      {
        model: Chatbot,
        as: "options"
      }
    ]
  });

  if (!queue) {
    throw new AppError("Chatbot not found", 404);
  }

  return queue;
};

export default ShowChatBotServices;
