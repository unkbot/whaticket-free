import { getIO } from "../../libs/socket";
import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { wbotMessageListener } from "./wbotMessageListener";
import wbotMonitor from "./wbotMonitor";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  try {
    const wbot = await initWbot(whatsapp);
    wbotMessageListener(wbot);
    wbotMonitor(wbot, whatsapp);
  } catch (err) {
    logger.error(err);
  }
};
