import Schedule from "../../models/Schedule";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string | number): Promise<void> => {
  const schedule = await Schedule.findOne({
    where: { id }
  });

  if (!schedule) {
    throw new AppError("ERR_NO_SCHEDULE_FOUND", 404);
  }

  await schedule.destroy();
};

export default DeleteService;
