import { writeFileSync } from "fs";
import axios from "axios";
import { join } from "path";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { getProfile } from "./graphAPI";

interface IMe {
  name: string;
  // eslint-disable-next-line camelcase
  first_name: string;
  // eslint-disable-next-line camelcase
  last_name: string;
  // eslint-disable-next-line camelcase
  profile_pic: string;
  id: string;
}

const verifyContact = async (msgContact: IMe) => {
  const contactData = {
    name:
      msgContact?.name || `${msgContact.first_name} ${msgContact.last_name}`,
    number: msgContact.id,
    profilePicUrl: msgContact.profile_pic,
    isGroup: false
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

export const verifyMessage = async (
  msg: any,
  ticket: Ticket,
  contact: Contact
) => {
  const messageData = {
    id: msg.mid,
    ticketId: ticket.id,
    contactId: msg.is_echo ? undefined : contact.id,
    body: msg.text,
    fromMe: msg.is_echo,
    read: msg.is_echo,
    quotedMsgId: null,
    ack: 2,
    dataJson: JSON.stringify(msg)
  };

  await CreateMessageService({ messageData });

  await ticket.update({
    lastMessage: msg.text
  });
};

export const verifyMessageMedia = async (
  msg: any,
  ticket: Ticket,
  contact: Contact
): Promise<void> => {
  const { data } = await axios.get(msg.attachments[0].payload.url, {
    responseType: "arraybuffer"
  });

  // eslint-disable-next-line no-eval
  const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<
    typeof import("file-type")
  >);

  const type = await fileTypeFromBuffer(data);

  const fileName = `${new Date().getTime()}.${type.ext}`;

  writeFileSync(
    join(__dirname, "..", "..", "..", "public", fileName),
    data,
    "base64"
  );

  const messageData = {
    id: msg.mid,
    ticketId: ticket.id,
    contactId: msg.is_echo ? undefined : contact.id,
    body: msg.text || fileName,
    fromMe: msg.is_echo,
    mediaType: msg.attachments[0].type,
    mediaUrl: fileName,
    read: msg.is_echo,
    quotedMsgId: null,
    ack: 2,
    dataJson: JSON.stringify(msg)
  };

  await CreateMessageService({ messageData });

  console.log(msg);
  await ticket.update({
    lastMessage: msg.text
  });
};

export const handleMessage = async (
  webhookEvent: any,
  channel
): Promise<any> => {
  if (webhookEvent.message) {
    let msgContact: IMe;

    const senderPsid = webhookEvent.sender.id;
    const recipientPsid = webhookEvent.recipient.id;
    const { message } = webhookEvent;
    const fromMe = message.is_echo;

    if (fromMe) {
      if (/\u200e/.test(message.text)) return;

      msgContact = await getProfile(recipientPsid);
    } else {
      msgContact = await getProfile(senderPsid);
    }

    const contact = await verifyContact(msgContact);

    const unreadCount = fromMe ? 0 : 1;

    const ticket = await FindOrCreateTicketService({
      whatsappId: null,
      contact,
      unreadMessages: unreadCount,
      channel
    });

    if (message.attachments) {
      await verifyMessageMedia(message, ticket, contact);
    } else {
      await verifyMessage(message, ticket, contact);
    }
  }
};
