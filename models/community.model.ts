import { Sequelize, DataTypes } from "sequelize";
import { Model } from "sequelize/types";

const User = require("./user.model");

const sequelize = new Sequelize("acumensa", "", "", {
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

interface CommunityAttributes {
  id: string;
  name: string;
  slug: string;
  owner: string;
  created_at: Date;
  updated_at: Date;
}

class Community
  extends Model<CommunityAttributes>
  implements CommunityAttributes
{
  public id!: string;
  public name!: string;
  public slug!: string;
  public owner!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Community.init(
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
        model: User,
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
    sequelize,
    tableName: "community",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Community table created successfully!");
  })
  .catch((error: Error) => {
    console.error("Unable to create table : ", error);
  });
