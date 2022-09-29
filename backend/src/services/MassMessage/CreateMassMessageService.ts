import MassMessages from "../../models/MassMessages";

interface ChatbotData {
  message: string;
  phone: string;
  whatsappId?: string;
}

const CreateChatBotServices = async (
  chatBotData: ChatbotData
): Promise<MassMessages> => {
  const chatBot = await MassMessages.create(chatBotData);

  return chatBot;
};

export default CreateChatBotServices;
