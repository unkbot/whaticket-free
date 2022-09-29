import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint("Chatbots", "Chatbots_name_key");
    return queryInterface.removeIndex("Chatbots", "name");
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint("Chatbots", "Chatbots_name_key");
    return queryInterface.removeIndex("Chatbots", "name");
  }
};
