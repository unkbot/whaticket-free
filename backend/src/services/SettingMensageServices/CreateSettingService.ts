import SettingMessage from "../../models/SettingMessage";

interface Request {
  contact: boolean;
  limit: string | number;
  minutes: string | number;
  optOut: string;
  photo: boolean;
  random: boolean;
  seconds: string | number;
  whatsappId: string | number;
}

const CreateSettingService = async (
  settingsData: Request
): Promise<SettingMessage | undefined> => {
  const checkExist = await SettingMessage.findOne({
    where: {
      whatsappId: settingsData.whatsappId
    }
  });

  if (checkExist) {
    await SettingMessage.update(settingsData, {
      where: {
        whatsappId: settingsData.whatsappId
      }
    });

    const find = await SettingMessage.findOne({
      where: {
        whatsappId: settingsData.whatsappId
      }
    });

    return find;
  }
  const settings = await SettingMessage.create(settingsData);
  return settings;
};

export default CreateSettingService;
