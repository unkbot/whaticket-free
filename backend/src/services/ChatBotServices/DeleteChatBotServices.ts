import ShowChatBotServices from "./ShowChatBotServices";

const DeleteChatBotServices = async (
  chatbotId: number | string,
): Promise<void> => {
  const chatbot = await ShowChatBotServices(chatbotId);

  await chatbot.destroy();
};

export default DeleteChatBotServices;
