import AppError from "../../errors/AppError";
import Chatbot from "../../models/Chatbot";

const ShowChatBotByChatbotIdServices = async (
  chatbotId: number | string
): Promise<Chatbot> => {
  const queue = await Chatbot.findOne({
    where: { chatbotId },
    include: [
      {
        model: Chatbot,
        as: "mainChatbot",
        attributes: ["id", "name", "greetingMessage"],
        order: [[{ model: Chatbot, as: "mainChatbot" }, "id", "ASC"]]
      },
      {
        model: Chatbot,
        as: "options",
        order: [[{ model: Chatbot, as: "options" }, "id", "ASC"]],
        attributes: ["id", "name", "greetingMessage"]
      }
    ],
    order: [["id", "asc"]]
  });

  if (!queue) {
    throw new AppError("ERR_CHATBOT_NOT_FOUND_SERVICE", 404);
  }

  return queue;
};

export default ShowChatBotByChatbotIdServices;
