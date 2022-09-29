import AppError from "../../errors/AppError";
import SettingMessage from "../../models/SettingMessage";

interface Request {
  key: string;
  value: string;
}

const UpdateSettingService = async ({
  key,
  value
}: Request): Promise<SettingMessage | undefined> => {
  const setting = await SettingMessage.findOne({
    where: { key }
  });

  if (!setting) {
    throw new AppError("ERR_NO_SETTING_FOUND", 404);
  }

  await setting.update({ value });

  return setting;
};

export default UpdateSettingService;
