import { Sequelize, DataTypes } from "sequelize";
import { Model } from "sequelize/types";

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

interface RoleAttributes {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

class Role extends Model<RoleAttributes> implements RoleAttributes {
  public id!: string;
  public name!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Role.init(
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
    sequelize,
    tableName: "role",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Role table created successfully!");
  })
  .catch((error: Error) => {
    console.error("Unable to create table : ", error);
  });
