"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Snowflake } = require("@theinternetfolks/snowflake");
const pool = require("../../db");
//role api
exports.addRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const id = Snowflake.generate();
        const options = {
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
        pool.query(query, role, (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Failed to create role" });
            }
            else {
                const createdRole = Object.assign({}, role);
                res.json({ status: true, content: { data: createdRole } });
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//get api
exports.getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1; // Current page number
        const limit = 10; // Number of roles per page
        // Count total number of roles
        const countQuery = "SELECT COUNT(*) AS total FROM role";
        const countResult = yield pool.query(countQuery);
        const totalRoles = countResult[0][0].total;
        // Calculate total number of pages
        const totalPages = Math.ceil(totalRoles / limit);
        // Calculate the offset for pagination
        const offset = (page - 1) * limit;
        // Retrieve roles with pagination
        const query = "SELECT id, name, DATE_FORMAT(created_at, '%Y-%m-%dT%T.%fZ') AS created_at, DATE_FORMAT(updated_at, '%Y-%m-%dT%T.%fZ') AS updated_at FROM role LIMIT ? OFFSET ?";
        const result = yield pool.query(query, [limit, offset]);
        const roles = result[0];
        const roleData = roles.map((role) => ({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
