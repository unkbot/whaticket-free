import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("MassMessages", {
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
      message: {
        type: DataTypes.STRING,
        defaultValue: false
      },
      phone: {
        type: DataTypes.STRING,
        defaultValue: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending"
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
