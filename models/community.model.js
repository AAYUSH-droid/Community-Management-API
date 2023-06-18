const { Sequelize, DataTypes } = require("sequelize");
const User = require("./user.model");
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

const Community = sequelize.define(
  "Community",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    owner: {
      type: DataTypes.STRING,
      references: {
        model: "User",
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  },

  {
    tableName: "community",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Community table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table : ", error);
  });
