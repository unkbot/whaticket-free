import DialogChatBots from "../../models/DialogChatBots";

interface Request {
  awaiting: number;
  contactId: number;
  chatbotId: number;
  queueId: number;
}

const CreateDialogChatBotsServices = async ({
  awaiting,
  contactId,
  chatbotId,
  queueId
}: Request): Promise<DialogChatBots> => {
  const quickAnswer = await DialogChatBots.create({
    awaiting,
    contactId,
    chatbotId,
    queueId
  });

  return quickAnswer;
};

export default CreateDialogChatBotsServices;
