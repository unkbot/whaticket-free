import { WASocket } from "@adiwajshing/baileys";
import { Store } from "../libs/store";
import { getWbot } from "../libs/wbot";
import Whatsapp from "../models/Whatsapp";

type Session = WASocket & {
  id?: number;
  store?: Store;
};
const GetWhatsappWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  const wbot = getWbot(whatsapp.id);
  return wbot;
};

export default GetWhatsappWbot;
