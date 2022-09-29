import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Chatbots", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      queueId: {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      chatbotId: {
        type: DataTypes.INTEGER,
        references: { model: "Chatbots", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      greetingMessage: {
        type: DataTypes.TEXT
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Chatbots");
  }
};
