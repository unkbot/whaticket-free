import fs from "fs";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
// import formatBody from "../../helpers/Mustache";
import { sendAttachment } from "./graphAPI";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

const typeAttachment = (media: Express.Multer.File) => {
  if (media.mimetype.includes("image")) {
    return "image";
  }
  if (media.mimetype.includes("video")) {
    return "video";
  }
  if (media.mimetype.includes("audio")) {
    return "audio";
  }

  return "file";
};

const sendFacebookMessageMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<any> => {
  try {
    // const hasBody = body
    //   ? formatBody(body as string, ticket.contact)
    //   : undefined;

    const type = typeAttachment(media);
    console.log(`Sending ${type} to ${ticket.contact.id}`);
    const sendMessage = await sendAttachment(
      ticket.contact.number,
      fs.createReadStream(media.path),
      type
    );

    await ticket.update({ lastMessage: body || media.filename });

    fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    console.log(err);
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export default sendFacebookMessageMedia;
