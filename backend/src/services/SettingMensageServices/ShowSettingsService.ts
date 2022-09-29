import SettingMessage from "../../models/SettingMessage";

const ShowSettingsService = async (
  whatsappId: number | string
): Promise<SettingMessage> => {
  const queue = await SettingMessage.findOne({
    where: {
      whatsappId
    }
  });

  if (queue) {
    return queue;
  }
};

export default ShowSettingsService;
