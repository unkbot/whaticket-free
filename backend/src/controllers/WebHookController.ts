import { Request, Response } from "express";
import { handleMessage } from "../services/FacebookServices/facebookMessageListener";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "whaticket";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
  }

  return res.status(403).json({
    message: "Forbidden"
  });
};

export const webHook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { body } = req;
  if (body.object === "page" || body.object === "instagram") {
    let channel: string;

    if (body.object === "page") {
      channel = "facebook";
    } else {
      channel = "instagram";
    }

    console.log(body);
    body.entry?.forEach((entry: any) => {
      entry.messaging?.forEach((data: any) => {
        handleMessage(data, channel);
      });
    });

    return res.status(200).json({
      message: "EVENT_RECEIVED"
    });
  }

  return res.status(404).json({
    message: body
  });
};
