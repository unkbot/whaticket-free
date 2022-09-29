import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Messages", "body", {
      type: DataTypes.TEXT
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Messages", "body", {
      type: DataTypes.TEXT
    });
  }
};
