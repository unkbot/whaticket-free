import Queue from "bull";
import moment from "moment";
import { Op } from "sequelize";
import { MessageData, SendMessage } from "./helpers/SendMessage";
import Whatsapp from "./models/Whatsapp";
import { logger } from "./utils/logger";
import Schedule from "./models/Schedule";
import Contact from "./models/Contact";
import GetDefaultWhatsApp from "./helpers/GetDefaultWhatsApp";

const connection = process.env.REDIS_URI || "";
const limiterMax = process.env.REDIS_OPT_LIMITER_MAX || 1;
const limiterDuration = process.env.REDIS_OPT_LIMITER_DURATION || 3000;

export const messageQueue = new Queue("MessageQueue", connection, {
  limiter: {
    max: limiterMax as number,
    duration: limiterDuration as number
  }
});

export const scheduleMonitor = new Queue("ScheduleMonitor", connection);
export const sendScheduledMessages = new Queue(
  "SendSacheduledMessages",
  connection
);

export function startQueueProcess() {
  logger.info("Iniciando processamento de filas");

  messageQueue.process("SendMessage", async job => {
    try {
      const { data } = job;
      const whatsapp = await Whatsapp.findByPk(data.whatsappId);

      if (whatsapp == null) {
        throw Error("Whatsapp não identificado");
      }

      const messageData: MessageData = data.data;

      await SendMessage(whatsapp, messageData);
    } catch (e: any) {
      console.log(e);
      logger.error("MessageQueue -> SendMessage: error", e.message);
      throw e;
    }
  });

  scheduleMonitor.process("Verify", async () => {
    try {
      const { count, rows: schedules } = await Schedule.findAndCountAll({
        where: {
          status: "PENDENTE",
          sentAt: null,
          sendAt: {
            [Op.lt]: new Date()
          }
        },
        include: [{ model: Contact, as: "contact" }]
      });

      if (count > 0) {
        schedules.map(async schedule => {
          await schedule.update({
            status: "AGENDADA"
          });
          sendScheduledMessages.add(
            "SendMessage",
            { schedule },
            { delay: 40000 }
          );
          logger.info(`Disparo agendado para: ${schedule.contact.name}`);
        });
      }
    } catch (e: any) {
      logger.error("SendScheduledMessage -> Verify: error", e.message);
      throw e;
    }
  });

  sendScheduledMessages.process("SendMessage", async job => {
    const {
      data: { schedule }
    } = job;
    let scheduleRecord = null;

    try {
      scheduleRecord = await Schedule.findByPk(schedule.id);
    } catch (e) {
      logger.info(`Erro ao tentar consultar agendamento: ${schedule.id}`);
    }

    try {
      const whatsapp = await GetDefaultWhatsApp();

      await SendMessage(whatsapp, {
        number: schedule.contact.number,
        body: schedule.body
      });

      await scheduleRecord?.update({
        sentAt: moment().format("YYYY-MM-DD HH:mm"),
        status: "ENVIADA"
      });

      logger.info(`Mensagem agendada enviada para: ${schedule.contact.name}`);
      sendScheduledMessages.clean(15000, "completed");
    } catch (e: any) {
      await scheduleRecord?.update({
        status: "ERRO"
      });
      logger.error("SendScheduledMessage -> SendMessage: error", e.message);
      throw e;
    }
  });

  // eslint-disable-next-line no-restricted-syntax
  // for (const status of ["active", "completed", "delayed", "failed", "wait"]) {
  //   sendScheduledMessages.clean(100, status);
  // }

  scheduleMonitor.add(
    "Verify",
    {},
    {
      repeat: { cron: "*/5 * * * * *" },
      removeOnComplete: false
    }
  );
}
