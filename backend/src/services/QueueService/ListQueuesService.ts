import Queue from "../../models/Queue";

const ListQueuesService = async (): Promise<Queue[]> => {
  const queues = await Queue.findAll({
    order: [["id", "ASC"]],
  });

  return queues;
};

export default ListQueuesService;
