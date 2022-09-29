import { proto, WASocket } from "@adiwajshing/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { Store } from "../../libs/store";
import { getBodyMessage, verifyMessage } from "./wbotMessageListener";
import ShowDialogChatBotsServices from "../DialogChatBotsServices/ShowDialogChatBotsServices";
import ShowQueueService from "../QueueService/ShowQueueService";
import ShowChatBotServices from "../ChatBotServices/ShowChatBotServices";
import DeleteDialogChatBotsServices from "../DialogChatBotsServices/DeleteDialogChatBotsServices";
import ShowChatBotByChatbotIdServices from "../ChatBotServices/ShowChatBotByChatbotIdServices";
import CreateDialogChatBotsServices from "../DialogChatBotsServices/CreateDialogChatBotsServices";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import formatBody from "../../helpers/Mustache";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import Chatbot from "../../models/Chatbot";
import User from "../../models/User";
import Setting from "../../models/Setting";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const isNumeric = (value: string) => /^-?\d+$/.test(value);

export const deleteAndCreateDialogStage = async (
  contact: Contact,
  chatbotId: number,
  ticket: Ticket
) => {
  try {
    await DeleteDialogChatBotsServices(contact.id);
    const bots = await ShowChatBotByChatbotIdServices(chatbotId);
    if (!bots) {
      await ticket.update({ isBot: false });
    }
    return await CreateDialogChatBotsServices({
      awaiting: 1,
      contactId: contact.id,
      chatbotId,
      queueId: bots.queueId
    });
  } catch (error) {
    await ticket.update({ isBot: false });
  }
};

const sendMessage = async (
  wbot: Session,
  contact: Contact,
  ticket: Ticket,
  body: string
) => {
  const sentMessage = await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    {
      text: formatBody(body, contact)
    }
  );
  verifyMessage(sentMessage, ticket, contact);
};

const sendDialog = async (
  choosenQueue: Chatbot,
  wbot: Session,
  contact: Contact,
  ticket: Ticket
) => {
  const showChatBots = await ShowChatBotServices(choosenQueue.id);
  if (showChatBots.options) {
    const buttonActive = await Setting.findOne({
      where: {
        key: "chatBotType"
      }
    });

    const botText = async () => {
      let options = "";

      showChatBots.options.forEach((option, index) => {
        options += `*${index + 1}* - ${option.name}\n`;
      });

      const optionsBack =
        options.length > 0
          ? `${options}\n*#* Voltar para o menu principal`
          : options;

      if (options.length > 0) {
        const body = `\u200e${choosenQueue.greetingMessage}\n\n${optionsBack}`;
        const sendOption = await sendMessage(wbot, contact, ticket, body);
        return sendOption;
      }

      const body = `\u200e${choosenQueue.greetingMessage}`;
      const send = await sendMessage(wbot, contact, ticket, body);
      return send;
    };

    const botButton = async () => {
      const buttons = [];
      showChatBots.options.forEach((option, index) => {
        buttons.push({
          buttonId: `${index + 1}`,
          buttonText: { displayText: option.name },
          type: 1
        });
      });

      if (buttons.length > 0) {
        const buttonMessage = {
          text: `\u200e${choosenQueue.greetingMessage}`,
          buttons,
          headerType: 1
        };

        const send = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          buttonMessage
        );

        await verifyMessage(send, ticket, contact);

        return send;
      }

      const body = `\u200e${choosenQueue.greetingMessage}`;
      const send = await sendMessage(wbot, contact, ticket, body);

      return send;
    };

    const botList = async () => {
      const sectionsRows = [];
      showChatBots.options.forEach((queue, index) => {
        sectionsRows.push({
          title: queue.name,
          rowId: `${index + 1}`
        });
      });

      if (sectionsRows.length > 0) {
        const sections = [
          {
            title: "Menu",
            rows: sectionsRows
          }
        ];

        const listMessage = {
          text: formatBody(`\u200e${choosenQueue.greetingMessage}`, contact),
          buttonText: "Escolha uma opção",
          sections
        };

        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          listMessage
        );

        await verifyMessage(sendMsg, ticket, contact);

        return sendMsg;
      }

      const body = `\u200e${choosenQueue.greetingMessage}`;
      const send = await sendMessage(wbot, contact, ticket, body);

      return send;
    };

    if (buttonActive.value === "text") {
      return botText();
    }

    if (buttonActive.value === "button" && showChatBots.options.length > 4) {
      return botText();
    }

    if (buttonActive.value === "button" && showChatBots.options.length <= 4) {
      return botButton();
    }

    if (buttonActive.value === "list") {
      return botList();
    }
  }
};

const backToMainMenu = async (
  wbot: Session,
  contact: Contact,
  ticket: Ticket
) => {
  await UpdateTicketService({
    ticketData: { queueId: null },
    ticketId: ticket.id
  });

  const { queues, greetingMessage } = await ShowWhatsAppService(wbot.id!);

  const buttonActive = await Setting.findOne({
    where: {
      key: "chatBotType"
    }
  });

  const botText = async () => {
    let options = "";

    queues.forEach((option, index) => {
      options += `*${index + 1}* - ${option.name}\n`;
    });

    const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, contact);
    await sendMessage(wbot, contact, ticket, body);

    const deleteDialog = await DeleteDialogChatBotsServices(contact.id);
    return deleteDialog;
  };

  const botButton = async () => {
    const buttons = [];
    queues.forEach((queue, index) => {
      buttons.push({
        buttonId: `${index + 1}`,
        buttonText: { displayText: queue.name },
        type: 1
      });
    });

    const buttonMessage = {
      text: formatBody(`\u200e${greetingMessage}`, contact),
      buttons,
      headerType: 1
    };

    const sendMsg = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      buttonMessage
    );

    await verifyMessage(sendMsg, ticket, contact);

    const deleteDialog = await DeleteDialogChatBotsServices(contact.id);
    return deleteDialog;
  };

  const botList = async () => {
    const sectionsRows = [];
    queues.forEach((queue, index) => {
      sectionsRows.push({
        title: queue.name,
        rowId: `${index + 1}`
      });
    });

    const sections = [
      {
        title: "Menu",
        rows: sectionsRows
      }
    ];

    const listMessage = {
      text: formatBody(`\u200e${greetingMessage}`, contact),
      buttonText: "Escolha uma opção",
      sections
    };

    const sendMsg = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      listMessage
    );

    await verifyMessage(sendMsg, ticket, contact);

    const deleteDialog = await DeleteDialogChatBotsServices(contact.id);
    return deleteDialog;
  };

  if (buttonActive.value === "text") {
    return botText();
  }

  if (buttonActive.value === "button" && queues.length > 4) {
    return botText();
  }

  if (buttonActive.value === "button" && queues.length <= 4) {
    return botButton();
  }

  if (buttonActive.value === "list") {
    return botList();
  }
};

export const sayChatbot = async (
  queueId: number,
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  msg: proto.IWebMessageInfo
): Promise<any> => {
  const selectedOption =
    msg?.message?.buttonsResponseMessage?.selectedButtonId ||
    msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
    getBodyMessage(msg);

  console.log("Selecionado a opção: ", selectedOption);

  if (!queueId && selectedOption && msg.key.fromMe) return;

  const getStageBot = await ShowDialogChatBotsServices(contact.id);

  if (selectedOption === "#") {
    const backTo = await backToMainMenu(wbot, contact, ticket);
    return backTo;
  }

  if (!getStageBot) {
    const queue = await ShowQueueService(queueId);

    const selectedOptions =
      msg?.message?.buttonsResponseMessage?.selectedButtonId ||
      msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
      getBodyMessage(msg);

    console.log("!getStageBot", selectedOptions);
    const choosenQueue = queue.chatbots[+selectedOptions - 1];

    if (!choosenQueue?.greetingMessage) {
      await DeleteDialogChatBotsServices(contact.id);
      return;
    } // nao tem mensagem de boas vindas
    if (choosenQueue) {
      if (choosenQueue.isAgent) {
        try {
          const getUserByName = await User.findOne({
            where: {
              name: choosenQueue.name
            }
          });
          const ticketUpdateAgent = {
            ticketData: {
              userId: getUserByName.id,
              status: "open"
            },
            ticketId: ticket.id
          };
          await UpdateTicketService(ticketUpdateAgent);
        } catch (error) {
          await deleteAndCreateDialogStage(contact, choosenQueue.id, ticket);
        }
      }
      await deleteAndCreateDialogStage(contact, choosenQueue.id, ticket);
      const send = await sendDialog(choosenQueue, wbot, contact, ticket);
      return send;
    }
  }

  if (getStageBot) {
    const selected = isNumeric(selectedOption) ? selectedOption : 1;
    const bots = await ShowChatBotServices(getStageBot.chatbotId);
    console.log("getStageBot", selected);

    const choosenQueue = bots.options[+selected - 1]
      ? bots.options[+selected - 1]
      : bots.options[0];

    console.log("choosenQueue", choosenQueue);

    if (!choosenQueue.greetingMessage) {
      await DeleteDialogChatBotsServices(contact.id);
      return;
    } // nao tem mensagem de boas vindas
    if (choosenQueue) {
      if (choosenQueue.isAgent) {
        const getUserByName = await User.findOne({
          where: {
            name: choosenQueue.name
          }
        });
        const ticketUpdateAgent = {
          ticketData: {
            userId: getUserByName.id,
            status: "open"
          },
          ticketId: ticket.id
        };
        await UpdateTicketService(ticketUpdateAgent);
      }
      await deleteAndCreateDialogStage(contact, choosenQueue.id, ticket);
      const send = await sendDialog(choosenQueue, wbot, contact, ticket);
      return send;
    }
  }
};
