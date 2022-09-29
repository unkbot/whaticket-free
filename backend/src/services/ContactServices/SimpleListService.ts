import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { FindOptions, Op } from "sequelize";

export interface SearchContactParams {
  name?: string;
}

const SimpleListService = async (params: SearchContactParams): Promise<Contact[]> => {
  let options: FindOptions = {
    order: [
      ['name', 'ASC']
    ]
  }
  const { name } = params

  if (name) {
    options.where = {
      name: {
        [Op.like]: `%${name}%`
      }
    }
  }

  const contacts = await Contact.findAll(options);

  if (!contacts) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contacts;
};

export default SimpleListService;
