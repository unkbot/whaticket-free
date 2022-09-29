import DialogChatBots from "../../models/DialogChatBots";

const DeleteDialogChatBotsServices = async (
  contactId: number | string
): Promise<void> => {
  const queue = await DialogChatBots.findOne({
    where: {
      contactId
    }
  });

  if (queue) {
    await queue.destroy();
  }
};

export default DeleteDialogChatBotsServices;
