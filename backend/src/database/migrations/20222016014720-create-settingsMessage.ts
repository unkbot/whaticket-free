import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("SettingMessages", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      contacts: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      photo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      random: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      limit: {
        type: DataTypes.INTEGER,
        defaultValue: 10
      },
      minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      sendToday: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "active"
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
    return queryInterface.dropTable("SettingMessage");
  }
};
