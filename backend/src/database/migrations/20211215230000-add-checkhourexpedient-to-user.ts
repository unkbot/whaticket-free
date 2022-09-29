import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "checkHourExpedient", {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "checkHourExpedient");
  }
};
