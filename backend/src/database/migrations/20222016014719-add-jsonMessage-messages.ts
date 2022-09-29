import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Messages", "dataJson", {
      type: DataTypes.JSON
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Messages", "dataJson");
  }
};
