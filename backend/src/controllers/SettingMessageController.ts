import { Request, Response } from "express";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import UpdateSettingService from "../services/SettingMensageServices/UpdateSettingService";
import ListSettingsService from "../services/SettingMensageServices/ListSettingsService";
import CreateSettingService from "../services/SettingMensageServices/CreateSettingService";
import ShowSettingsService from "../services/SettingMensageServices/ShowSettingsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const settings = await ListSettingsService();

  return res.status(200).json(settings);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  console.log(whatsappId);
  const settings = await ShowSettingsService(whatsappId);

  return res.status(200).json(settings);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    contact,
    limit,
    minutes,
    optOut,
    photo,
    random,
    seconds,
    whatsappId
  } = req.body;

  try {
    console.log(req.body);
    const chatbot = await CreateSettingService({
      contact,
      limit,
      minutes,
      optOut,
      photo,
      random,
      seconds,
      whatsappId
    });

    const io = getIO();
    io.emit("settings", {
      action: "update",
      chatbot
    });

    return res.status(200).json(chatbot);
  } catch (error) {
    throw new AppError(error.message);
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const setting = await UpdateSettingService(req.body);

  return res.status(200).json(setting);
};
