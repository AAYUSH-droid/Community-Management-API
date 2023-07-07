"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const types_1 = require("sequelize/types");
const sequelize = new sequelize_1.Sequelize("acumensa", "root", "", {
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
class Role extends types_1.Model {
}
Role.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize,
    tableName: "role",
});
sequelize
    .sync()
    .then(() => {
    console.log("Role table created successfully!");
})
    .catch((error) => {
    console.error("Unable to create table : ", error);
});
