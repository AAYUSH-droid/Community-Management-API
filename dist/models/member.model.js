"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const types_1 = require("sequelize/types");
const Community = require("./community.model");
const User = require("./user.model");
const Role = require("./role.model");
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
class Member extends types_1.Model {
}
Member.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    community: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: Community,
            key: "id",
        },
    },
    user: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: Role,
            key: "id",
        },
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize,
    tableName: "member",
});
sequelize
    .sync()
    .then(() => {
    console.log("Member table created successfully!");
})
    .catch((error) => {
    console.error("Unable to create table : ", error);
});
