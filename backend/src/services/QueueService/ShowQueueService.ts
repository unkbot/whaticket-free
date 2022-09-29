import AppError from "../../errors/AppError";
import Chatbot from "../../models/Chatbot";
import Queue from "../../models/Queue";

const ShowQueueService = async (queueId: number | string): Promise<Queue> => {
  const queue = await Queue.findByPk(queueId, {
    include: ["chatbots"],
    order: [
      [{ model: Chatbot, as: "chatbots" }, "id", "asc"],
      ["id", "ASC"]
    ]
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return queue;
};

export default ShowQueueService;
