import Whatsapp from "../models/Whatsapp";
import GetWhatsappWbot from "./GetWhatsappWbot";
import SendWhatsAppMedia, { processAudio, processAudioFile } from "../services/WbotServices/SendWhatsAppMedia";
import mime from "mime-types";
import fs from "fs";
import { AnyMessageContent } from "@adiwajshing/baileys";

export type MessageData = {
  number: number | string;
  body: string;
  mediaPath?: string;
};

export const SendMessage = async (
  whatsapp: Whatsapp,
  messageData: MessageData
): Promise<any> => {
  try {
    const wbot = await GetWhatsappWbot(whatsapp);
    const jid = `${messageData.number}@s.whatsapp.net`;
    let message: any;
    const body = `\u200e${messageData.body}`;
    console.log("envio de mensagem");
    if (messageData.mediaPath) {

      const media = {
        path: messageData.mediaPath,
        mimetype: mime.lookup(messageData.mediaPath)
      } as Express.Multer.File;

      console.log(media)
      const pathMedia = messageData.mediaPath;
      const typeMessage = media.mimetype.split("/")[0];
      let options: AnyMessageContent;

      if (typeMessage === "video") {
        options = {
          video: fs.readFileSync(pathMedia),
          caption: body,
          fileName: media.originalname
          // gifPlayback: true
        };
      } else if (typeMessage === "audio") {
        const typeAudio = media.originalname.includes("audio-record-site");
        if (typeAudio) {
          const convert = await processAudio(media.path);
          options = {
            audio: fs.readFileSync(convert),
            mimetype: typeAudio ? "audio/mp4" : media.mimetype,
            ptt: true
          };
        } else {
          const convert = await processAudioFile(media.path);
          options = {
            audio: fs.readFileSync(convert),
            mimetype: typeAudio ? "audio/mp4" : media.mimetype
          };
        }
      } else if (typeMessage === "document") {
        options = {
          document: fs.readFileSync(pathMedia),
          caption: body,
          fileName: media.originalname,
          mimetype: media.mimetype
        };
      } else if (typeMessage === "application") {
        options = {
          document: fs.readFileSync(pathMedia),
          caption: body,
          fileName: media.originalname,
          mimetype: media.mimetype
        };
      } else {
        options = {
          image: fs.readFileSync(pathMedia),
          caption: body
        };
      }

       message = await wbot.sendMessage(
        jid,
        {
          ...options
        }
      );

      console.log(message);
    } else {
      console.log(body);
      message = await wbot.sendMessage(jid, {
        text: body
      });
    }

    return message;
  } catch (err: any) {
    console.log(err)
    throw new Error(err);
  }
};
