import { add } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Setting from "../../models/Setting";

import ShowTicketService from "./ShowTicketService";

interface IRequest {
  contact: Contact;
  whatsappId?: number;
  unreadMessages?: number;
  channel?: string;
  groupContact?: Contact;
}

const FindOrCreateTicketService = async ({
  contact,
  whatsappId,
  unreadMessages,
  channel,
  groupContact
}: IRequest): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      whatsappId,
      channel
    }
  });

  if (ticket) {
    await ticket.update({ unreadMessages });
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        whatsappId,
        channel
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages,
        channel,
        isBot: true
      });
    }
  }
  const msgIsGroupBlock = await Setting.findOne({
    where: { key: "timeCreateNewTicket" }
  });

  const value = msgIsGroupBlock ? parseInt(msgIsGroupBlock.value, 10) : 7200;

  if (!ticket && !groupContact) {
    ticket = await Ticket.findOne({
      where: {
        updatedAt: {
          [Op.between]: [+add(new Date(), { seconds: value }), +new Date()]
        },
        contactId: contact.id,
        whatsappId,
        channel
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages,
        channel,
        isBot: true
      });
    }
  }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: "pending",
      isGroup: !!groupContact,
      isBot: true,
      unreadMessages,
      channel,
      whatsappId
    });
  }

  ticket = await ShowTicketService(ticket.id);

  return ticket;
};

export default FindOrCreateTicketService;
