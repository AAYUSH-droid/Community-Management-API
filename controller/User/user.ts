const { Snowflake } = require("@theinternetfolks/snowflake");
const bcrypt = require("bcrypt");
const pool = require("../../db");
// import pool from "../../db";
// const jwt = require("jsonwebtoken");
import jwt, { VerifyErrors, Secret } from "jsonwebtoken";
import express, { Request, Response } from "express";
const { verifyToken } = require("../../auth/verifytoken");
import { RowDataPacket } from "mysql2";

exports.signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const id = Snowflake.generate();

    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const now = new Date();
    const createdAt = now
      .toLocaleString("en-IN", options)
      .replace(/(\d+)\/(\d+)\/(\d+),/, "$3-$2-$1");

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO user (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)";
    const values = [id, name, email, hashedPassword, createdAt];
    await pool.query(query, values);

    const accessToken = jwt.sign({ id: id }, process.env.JWT_SECRET as Secret, {
      expiresIn: "1h",
    });

    const userData = {
      id: id,
      name: name,
      email: email,
      created_at: createdAt,
    };

    const response = {
      status: true,
      content: {
        data: userData,
        meta: {
          access_token: accessToken,
        },
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//sign api
exports.signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // if the user exists in the database
    const query =
      "SELECT id, name, email, created_at, password FROM user WHERE email = ?";
    const [result] = await pool.query(query, [email]);
    const user = (result as RowDataPacket[])[0];

    // User not found or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a new token for the user
    const tokenPayload = {
      id: user.id,
      email: user.email,
    };
    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET as Secret,
      {
        expiresIn: "24h",
      }
    );

    // access token as a cookie
    res.cookie("access_token", accessToken, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      // sameSite: "Strict",
    });

    delete user.password;

    const response = {
      status: true,
      content: {
        data: user,
        meta: {
          access_token: accessToken,
        },
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.me = async (req: Request, res: Response) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader
      ? authorizationHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized used" });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as Secret,
      async (err: VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.status(401).json({ error: "Invalid access token" });
        }

        const userId = decoded.id;

        // Retrieve the user details from the database using the user ID
        const query =
          "SELECT id, name, email, created_at FROM user WHERE id = ?";
        const [rows] = await pool.query(query, [userId]);
        const user = rows as RowDataPacket[][0];
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        delete user.password;

        return res.json({
          status: true,
          content: {
            data: user,
          },
        });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
