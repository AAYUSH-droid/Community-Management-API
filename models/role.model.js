const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("acumensa", "root", "aayushdb", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  },

  {
    tableName: "role",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Role table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table : ", error);
  });
