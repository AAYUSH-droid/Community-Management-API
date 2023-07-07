"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const types_1 = require("sequelize/types");
const User = require("./user.model");
const sequelize = new sequelize_1.Sequelize("acumensa", "", "", {
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
class Community extends types_1.Model {
}
Community.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
    },
    owner: {
        type: sequelize_1.DataTypes.STRING,
        references: {
            model: User,
            key: "id",
        },
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize,
    tableName: "community",
});
sequelize
    .sync()
    .then(() => {
    console.log("Community table created successfully!");
})
    .catch((error) => {
    console.error("Unable to create table : ", error);
});
