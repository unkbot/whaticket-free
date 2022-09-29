import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  extraInfo = []
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  const io = getIO();
  let contact: Contact | null;

  contact = await Contact.findOne({ where: { number } });

  if (contact) {
    try {
      await contact.update({ profilePicUrl });

      io.emit("contact", {
        action: "update",
        contact
      });
    } catch (error) {
      console.log(error);
    }
  }

  if (!contact) {
    try {
      contact = await Contact.create({
        name,
        number,
        profilePicUrl,
        email,
        isGroup,
        extraInfo
      });

      io.emit("contact", {
        action: "create",
        contact
      });
    } catch (error) {
      console.log(error);
    }
  }

  return contact;
};

export default CreateOrUpdateContactService;
