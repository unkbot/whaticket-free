import MassMessages from "../../models/MassMessages";

const CleanMassMessageService = async (): Promise<void> => {
  await MassMessages.truncate();
};

export default CleanMassMessageService;
