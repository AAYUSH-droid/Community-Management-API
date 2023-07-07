import { Sequelize, DataTypes } from "sequelize";
import { Model } from "sequelize/types";

const sequelize = new Sequelize("acumensa", "root", "aayushdb", {
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

interface UserAttributes {
  id: string;
  name?: string | null;
  email: string;
  password?: string;
  created_at: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public name?: string | null;
  public email!: string;
  public password?: string;
  public created_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(64),
      defaultValue: null,
    },
    email: {
      type: DataTypes.STRING(128),
      unique: true,
    },
    password: {
      type: DataTypes.STRING(64),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "user", // Set the table name
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("User table created successfully!");
  })
  .catch((error: Error) => {
    console.error("Unable to create table : ", error);
  });

export default User;
