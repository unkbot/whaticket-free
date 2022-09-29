import Chatbot from "../../models/Chatbot";

interface ChatbotData {
  name: string;
  color: string;
  greetingMessage?: string;
}

const CreateChatBotServices = async (
  chatBotData: ChatbotData
): Promise<Chatbot> => {
  const chatBot = await Chatbot.create(chatBotData);
  return chatBot;
};

export default CreateChatBotServices;
