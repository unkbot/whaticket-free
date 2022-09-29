import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const GetProfilePicUrl = async (number: string): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();
  const wbot = getWbot(defaultWhatsapp.id);
  let profilePicUrl: string

  try {
    profilePicUrl = await wbot.profilePictureUrl(`${number}@s.whatsapp.net`);
  } catch (err) {
     profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  return profilePicUrl;
};

export default GetProfilePicUrl;
