import { WASocket } from "@adiwajshing/baileys";
import Queue from "bull";
import moment from "moment";
import { getWbot } from "./libs/wbot";
import Contact from "./models/Contact";
import MassMessages from "./models/MassMessages";
import SettingMessage from "./models/SettingMessage";
import Whatsapp from "./models/Whatsapp";
import FindOrCreateTicketService from "./services/TicketServices/FindOrCreateTicketService";
import { verifyMessage } from "./services/WbotServices/wbotMessageListener";
import ListWhatsAppsService from "./services/WhatsappService/ListWhatsAppsService";
import { logger } from "./utils/logger";

let jobWork: boolean;

const connection = process.env.REDIS_URI || "";
const limiterMax = process.env.REDIS_OPT_LIMITER_MAX || 1;
const limiterDuration = process.env.REDIS_OPT_LIMITER_DURATION || 3000;

export const scheduleMonitor = new Queue("ScheduleMonitorSend", connection, {
  limiter: {
    max: limiterMax as number,
    duration: limiterDuration as number
  }
});

export const IntervalMap = new Map();

const verifyNumber = async (phone: string, whatsappId: number) => {
  try {
    const wbot = getWbot(whatsappId);
    const [result] = await (wbot as WASocket).onWhatsApp(
      `${phone}@s.whatsapp.net`
    );
    return result;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

const picturePhone = async (phone: string, whatsappId: number) => {
  try {
    const wbot = getWbot(whatsappId);
    const pictureUrl = await (wbot as WASocket).profilePictureUrl(
      `${phone}@s.whatsapp.net`
    );
    return pictureUrl;
  } catch (error) {
    return error;
  }
};

const sendMessageWhatsapp = async (jid: string, schedule: MassMessages) => {
  const wbot = getWbot(schedule.whatsappId) as WASocket;

  let contact: Contact;

  contact = await Contact.findOne({
    where: { number: schedule.phone }
  });

  if (!contact) {
    contact = await Contact.create({
      number: schedule.phone,
      name: schedule.phone
    });
  }

  const contactAndTicket = await FindOrCreateTicketService({
    contact,
    whatsappId: schedule.whatsappId,
    channel: "whatsapp"
  });

  const send = await wbot.sendMessage(jid, {
    text: schedule.message
  });

  await verifyMessage(send, contactAndTicket, contact);

  await schedule.update({
    status: "sent"
  });

  logger.info(`${schedule.phone} - mensagem enviada`);
};

const sendMessage = async (whatsappId: number, photo: boolean) => {
  logger.info("sendMessage", Date.now());
  if (!whatsappId || whatsappId === null || whatsappId === undefined) return;

  const getMessage = await MassMessages.findOne({
    where: {
      whatsappId,
      status: "pending"
    }
  });

  if (!getMessage) {
    logger.info("Não há mensagens pendentes");
    return;
  }

  const checkerNumber = await verifyNumber(getMessage.phone, whatsappId);

  if (!checkerNumber?.exists) {
    logger.error(`${getMessage.phone} - não existe`);
    await getMessage.update({
      status: "number not exists"
    });
    return;
  }

  let isContactPhoto: boolean;
  if (photo) {
    try {
      const pictureUrl = await picturePhone(getMessage.phone, whatsappId);
      logger.info(pictureUrl);
      isContactPhoto = true;
    } catch (error) {
      isContactPhoto = false;
    }
  }

  if (photo && !isContactPhoto) {
    logger.warn(
      `${getMessage.phone} - não tem foto, não enviar por que o contato não tem foto`
    );
    await getMessage.update({
      status: "no photo contact"
    });
    return;
  }

  if (photo && isContactPhoto) {
    logger.info(
      `${getMessage.phone} - fazendo o envio para o whatsapp para usuário com e sem foto!`
    );

    await sendMessageWhatsapp(checkerNumber.jid, getMessage);
  }

  if (!photo) {
    await sendMessageWhatsapp(checkerNumber.jid, getMessage);
  }
};

const processMessage = async (whatsappId: number) => {
  const setting = await SettingMessage.findOne({
    where: {
      whatsappId
    }
  });

  if (!setting) {
    logger.info("Configuração de envio não encontrada da conexão");
    return;
  }

  const { limit, minutes, seconds, photo, random } = setting;

  if (!limit) {
    logger.warn(
      `conexão sem limite configurado, envio parado. ${setting.whatsappId}`
    );

    return;
  }

  logger.info(
    `limit: ${limit} minutes: ${minutes} seconds: ${seconds} photo: ${photo} random: ${random}`
  );

  const time = minutes * 60 * 1000 + seconds * 1000;

  const intervalExist = IntervalMap.get(whatsappId);

  if (!intervalExist) {
    const interval = setInterval(async () => {
      logger.info(
        `Iniciando a conexao com id ${whatsappId} as - ${new Date()}`
      );
      // validar limite, hora  de inicio e hora de fim
      const lastUpdate = moment(setting.updatedAt);
      const now = moment();
      const diff = now.diff(lastUpdate, "hours");

      if (diff > 24) {
        await setting.update({
          sendToday: 0
        });
      } else if (setting.sendToday >= setting.limit) {
        console.log(`Limite de envio atingido ${whatsappId}`);
        return;
      }

      if (whatsappId) {
        sendMessage(whatsappId, photo);
      }
    }, time); // mudar pro time

    IntervalMap.set(whatsappId, interval);
  }
};

export const runSendMessage = async (): Promise<void> => {
  if (!jobWork) {
    const whatsapps = await ListWhatsAppsService();

    if (!whatsapps) {
      logger.info("Não há conexões cadastradas");
      return;
    }

    const whatsappConnected = whatsapps.filter(
      (whatsapp: Whatsapp) => whatsapp.status === "CONNECTED"
    );

    if (!whatsappConnected.length) {
      logger.info("Nenhum whatsapp conectado");
      return;
    }

    jobWork = true;

    whatsappConnected.forEach(async (whatsapp: Whatsapp) => {
      if (whatsapp) {
        processMessage(whatsapp.id);
      }
    });

    logger.info(
      `Total de conexao Prontas para envio!: ${whatsappConnected.length}`
    );
  }
};
