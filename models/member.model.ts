import { Sequelize, DataTypes } from "sequelize";
import { Model } from "sequelize/types";

const Community = require("./community.model");
const User = require("./user.model");
const Role = require("./role.model");

const sequelize = new Sequelize("acumensa", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error: Error) => {
    console.error("Unable to connect to the database: ", error);
  });

interface MemberAttributes {
  id: string;
  community: string;
  user: string;
  role: string;
  created_at: Date;
}

class Member extends Model<MemberAttributes> implements MemberAttributes {
  public id!: string;
  public community!: string;
  public user!: string;
  public role!: string;
  public created_at!: Date;
}

Member.init(
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
        model: Community,
        key: "id",
      },
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "member",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Member table created successfully!");
  })
  .catch((error: Error) => {
    console.error("Unable to create table : ", error);
  });
