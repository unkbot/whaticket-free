import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import GetRandWhatsApp from "../helpers/GetRandWhatsApp";
import GetTicketWbot from "../helpers/GetTicketWbot";
import { getIO } from "../libs/socket";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import CleanMassMessageService from "../services/MassMessage/CleanMassMessageervices";
import CreateMassMessageervices from "../services/MassMessage/CreateMassMessageService";
import DeleteMassMessageService from "../services/MassMessage/DeleteMassMessageService";
import ListMassMessageService from "../services/MassMessage/ListMassMessageService";

import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";

import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import { verifyMessage } from "../services/WbotServices/wbotMessageListener";

type MessageData = {
  message: string;
  phone: string;
  whatsappId?: [];
};

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { message, phone, whatsappId }: MessageData = req.body;

  const medias = req.files as Express.Multer.File[];
  const formatNumber = phone.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate({ number: formatNumber });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  let contact: Contact;

  contact = await Contact.findOne({
    where: { number: formatNumber }
  });

  if (!contact) {
    contact = await Contact.create({
      number: formatNumber,
      name: formatNumber
    });
  }

  try {
    let contactAndTicket: Ticket;
    console.log(typeof whatsappId);
    if (whatsappId && typeof whatsappId === "number") {
      contactAndTicket = await FindOrCreateTicketService({
        contact,
        whatsappId,
        channel: "whatsapp"
      });
      console.log("conexão definida.");
    } else {
      const random = await GetRandWhatsApp();

      if (!random) {
        throw new AppError("ERR_NO_DEF_WAPP_FOUND");
      }

      console.log("conexão random");

      contactAndTicket = await FindOrCreateTicketService({
        contact,
        whatsappId: random.id,
        channel: "whatsapp"
      });
    }

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await SendWhatsAppMedia({
            body: message,
            media,
            ticket: contactAndTicket
          });
        })
      );
    } else {
      const buttons = [
        { buttonId: "yes", buttonText: { displayText: "Sim" }, type: 1 },
        { buttonId: "no", buttonText: { displayText: "Não" }, type: 1 }
      ];

      const buttonMessage = {
        text: message || "Escolha uma das opções abaixo",
        buttons,
        headerType: 4
      };

      const wbot = await GetTicketWbot(contactAndTicket);

      const isNumberExit = await wbot.onWhatsApp(
        `${formatNumber}@s.whatsapp.net`
      );

      if (!isNumberExit[0]?.exists) {
        console.log("number not found");
      }

      console.log(isNumberExit);

      setTimeout(async () => {
        try {
          const send = await wbot.sendMessage(
            isNumberExit[0]?.jid,
            buttonMessage
          );

          await verifyMessage(send, contactAndTicket, contact);
        } catch (err) {
          console.log(
            `Mensagem não enviada para o contato. ${isNumberExit[0]?.jid}`
          );
        }
      }, 1000 * 5);
    }

    return res.send();
  } catch (error) {
    console.log(error);
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { body } = req;

  // remover os registros repetidos

  const filter = body
    .map((e: any) => JSON.stringify(e))
    .reduce(
      // eslint-disable-next-line no-sequences
      (acc: any[], cur: any) => (acc.includes(cur) || acc.push(cur), acc),
      []
    )
    .map((e: string) => JSON.parse(e));

  filter.forEach(async element => {
    await CreateMassMessageervices(element);
  });

  return res.status(200).json(body);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { messages, count, hasMore } = await ListMassMessageService({
    searchParam,
    pageNumber
  });

  return res.json({ messages, count, hasMore });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { massMessageId } = req.params;

  await DeleteMassMessageService(massMessageId);

  const io = getIO();
  io.emit("massMessage", {
    action: "delete",
    massMessageId
  });

  return res.status(200).json({ message: "Registro deletado" });
};

export const clean = async (req: Request, res: Response): Promise<Response> => {
  await CleanMassMessageService();

  return res.status(200).json({ message: "Registro deletado" });
};
