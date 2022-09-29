import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import DeleteBaileysService from "../BaileysServices/DeleteBaileysService";

const DeleteWhatsAppService = async (id: string): Promise<void> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await whatsapp.destroy();
  await DeleteBaileysService(id);
};

export default DeleteWhatsAppService;
