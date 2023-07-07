"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const types_1 = require("sequelize/types");
const sequelize = new sequelize_1.Sequelize("acumensa", "root", "aayushdb", {
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
class User extends types_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(64),
        defaultValue: null,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(128),
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(64),
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: "user", // Set the table name
});
sequelize
    .sync()
    .then(() => {
    console.log("User table created successfully!");
})
    .catch((error) => {
    console.error("Unable to create table : ", error);
});
exports.default = User;
