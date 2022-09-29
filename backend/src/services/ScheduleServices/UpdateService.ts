import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
import ShowService from "./ShowService";

interface ScheduleData {
  id?: number;
  body?: string;
  sendAt?: string;
  sentAt?: string;
  contactId?: number;
  ticketId?: number;
  userId?: number;
}

interface Request {
  scheduleData: ScheduleData;
  id: string | number;
}

const UpdateUserService = async ({
  scheduleData,
  id
}: Request): Promise<Schedule | undefined> => {
  const schedule = await ShowService(id);

  const schema = Yup.object().shape({
    body: Yup.string().min(5)
  });

  const {
    body,
    sendAt,
    sentAt,
    contactId,
    ticketId,
    userId,
  } = scheduleData;

  try {
    await schema.validate({ body });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await schedule.update({
    body,
    sendAt,
    sentAt,
    contactId,
    ticketId,
    userId,
  });

  await schedule.reload();
  return schedule;
};

export default UpdateUserService;
