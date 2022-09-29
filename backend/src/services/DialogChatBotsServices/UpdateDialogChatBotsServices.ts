import DialogChatBots from "../../models/DialogChatBots";
import AppError from "../../errors/AppError";

interface QuickAnswerData {
  awaiting?: number;
  contactId?: number;
  chatbotId?: number;
}

interface Request {
  quickAnswerData: QuickAnswerData;
  quickAnswerId: string;
}

const UpdateDialogChatBotsServices = async ({
  quickAnswerData,
  quickAnswerId
}: Request): Promise<DialogChatBots> => {
  const { awaiting, contactId, chatbotId } = quickAnswerData;

  const quickAnswer = await DialogChatBots.findOne({
    where: { id: quickAnswerId },
    attributes: ["id", "awaitingt", "contactId", "chatbotId"]
  });

  if (!quickAnswer) {
    throw new AppError("ERR_NO_DIALOG_CHATBOT_FOUND", 404);
  }
  await quickAnswer.update({
    awaiting,
    contactId,
    chatbotId
  });

  await quickAnswer.reload({
    attributes: ["id", "awaitingt", "contactId", "chatbotId"]
  });

  return quickAnswer;
};

export default UpdateDialogChatBotsServices;
