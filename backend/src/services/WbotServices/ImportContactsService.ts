import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";
import ShowBaileysService from "../BaileysServices/ShowBaileysService";
import CreateContactService from "../ContactServices/CreateContactService";

const ImportContactsService = async (userId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(userId);

  const wbot = getWbot(defaultWhatsapp.id);

  let phoneContacts;

  try {
    const contactsString = await ShowBaileysService(wbot.id);
    phoneContacts = JSON.parse(JSON.stringify(contactsString.contacts));
  } catch (err) {
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  phoneContacts.forEach(async ({ id, name }) => {
    if (id === "status@broadcast" || id.includes("g.us") === "g.us") return;
    const number = id.replace(/\D/g, "");

    const numberExists = await Contact.findOne({
      where: { number }
    });

    if (!numberExists) {
      try {
        await CreateContactService({ number, name });
      } catch (error) {
        console.log(error);
        logger.warn(
          `Could not get whatsapp contacts from phone. Err: ${error}`
        );
      }
    }
  });
};

export default ImportContactsService;
