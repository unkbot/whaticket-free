import { WAMessage } from "@adiwajshing/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
}: Request): Promise<WAMessage> => {
  let options = {};
  const wbot = await GetTicketWbot(ticket);
  const number = `${ticket.contact.number}@${
    ticket.isGroup ? "g.us" : "s.whatsapp.net"
  }`;
  if (quotedMsg) {
    const chatMessages = await Message.findOne({
      where: {
        id: quotedMsg.id
      }
    });

    const msgFound = JSON.parse(JSON.stringify(chatMessages.dataJson));

    options = {
      quoted: {
        key: msgFound.key,
        message: {
          extendedTextMessage: msgFound.message.extendedTextMessage
        }
      }
    };
  }

  try {
    const sentMessage = await wbot.sendMessage(
      number,
      {
        text: formatBody(body, ticket.contact)
      },
      {
        ...options
      }
    );
    await ticket.update({ lastMessage: formatBody(body, ticket.contact) });
    return sentMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
