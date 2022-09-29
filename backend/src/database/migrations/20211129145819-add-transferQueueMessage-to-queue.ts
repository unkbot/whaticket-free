import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Queues", "transferQueueMessage", {
      type: DataTypes.TEXT
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Queues", "transferQueueMessage");
  }
};
