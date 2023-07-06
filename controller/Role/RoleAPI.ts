const { Snowflake } = require("@theinternetfolks/snowflake");
const pool = require("../../db");
import mysql, { MysqlError } from "mysql";
import express, { Request, Response } from "express";

//role api
exports.addRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
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
    const updatedAt = createdAt;

    const role = { id, name, created_at: createdAt, updated_at: updatedAt };

    // Save the role to the database
    const query = "INSERT INTO role SET ?";
    pool.query(query, role, (err: mysql.MysqlError) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create role" });
      } else {
        const createdRole = { ...role };
        res.json({ status: true, content: { data: createdRole } });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//defining Role interface:
interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

//get api
exports.getRoles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Current page number
    const limit = 10; // Number of roles per page

    // Count total number of roles
    const countQuery = "SELECT COUNT(*) AS total FROM role";
    const countResult = await pool.query(countQuery);
    const totalRoles = countResult[0][0].total;

    // Calculate total number of pages
    const totalPages = Math.ceil(totalRoles / limit);

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // Retrieve roles with pagination
    const query =
      "SELECT id, name, DATE_FORMAT(created_at, '%Y-%m-%dT%T.%fZ') AS created_at, DATE_FORMAT(updated_at, '%Y-%m-%dT%T.%fZ') AS updated_at FROM role LIMIT ? OFFSET ?";
    const result = await pool.query(query, [limit, offset]);
    const roles = result[0];

    const roleData = roles.map((role: Role) => ({
      id: role.id,
      name: role.name,
      created_at: role.created_at,
      updated_at: role.updated_at,
    }));

    const response = {
      status: true,
      content: {
        meta: {
          total: totalRoles,
          pages: totalPages,
          page: page,
        },
        data: roleData,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
