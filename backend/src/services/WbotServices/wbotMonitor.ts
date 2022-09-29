import {
  WASocket,
  BinaryNode,
  Contact as BContact
} from "@adiwajshing/baileys";
import * as Sentry from "@sentry/node";

import { Op } from "sequelize";
// import { getIO } from "../../libs/socket";
import { Store } from "../../libs/store";
import Contact from "../../models/Contact";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateMessageService from "../MessageServices/CreateMessageService";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp
): Promise<void> => {
  try {
    wbot.ws.on("CB:call", async (node: BinaryNode) => {
      const content = node.content[0] as any;

      if (content.tag === "offer") {
        const { from, id } = node.attrs;
        console.log(`${from} is calling you with id ${id}`);
      }

      if (content.tag === "terminate") {
        const sendMsgCall = await Setting.findOne({
          where: { key: "call" }
        });

        if (sendMsgCall.value === "disabled") {
          await wbot.sendMessage(node.attrs.from, {
            text: "*Mensagem Automática:*\nAs chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado"
          });

          const number = node.attrs.from.replace(/\D/g, "");

          const contact = await Contact.findOne({
            where: { number }
          });

          const ticket = await Ticket.findOne({
            where: {
              contactId: contact.id,
              whatsappId: wbot.id,
              status: { [Op.or]: ["open", "pending"] }
            }
          });
          // se não existir o ticket não faz nada.
          if (!ticket) return;
          const date = new Date();
          const hours = date.getHours();
          const minutes = date.getMinutes();

          const body = `Chamada de voz/vídeo perdida às ${hours}:${minutes}`;
          const messageData = {
            id: content.attrs["call-id"],
            ticketId: ticket.id,
            contactId: contact.id,
            body,
            fromMe: false,
            mediaType: "call_log",
            read: true,
            quotedMsgId: null,
            ack: 1
          };

          await ticket.update({
            lastMessage: body
          });

          return CreateMessageService({ messageData });
        }
      }
    });

    wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {
      console.log("upsert", contacts);
      await createOrUpdateBaileysService({
        whatsappId: whatsapp.id,
        contacts
      });
    });
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;
