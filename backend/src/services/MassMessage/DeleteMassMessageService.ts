import MassMessages from "../../models/MassMessages";
import AppError from "../../errors/AppError";

const DeleteMassMessageService = async (id: string): Promise<void> => {
  const massMessage = await MassMessages.findOne({
    where: { id }
  });

  if (!massMessage) {
    throw new AppError("ERR_NO_MASS_MESSAGE_FOUND", 404);
  }

  await massMessage.destroy();
};

export default DeleteMassMessageService;
