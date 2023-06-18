const { Sequelize, DataTypes } = require("sequelize");
const Community = require("./community.model");
const User = require("./user.model");
const Role = require("./role.model");

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

const Member = sequelize.define(
  "Member",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    community: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Community",
        key: "id",
      },
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Role",
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "member",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Member table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table : ", error);
  });
