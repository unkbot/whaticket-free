import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("DialogChatBots", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      awaiting: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      chatbotId: {
        type: DataTypes.INTEGER,
        references: { model: "Chatbots", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
    },
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("DialogChatBots");
  }
};
