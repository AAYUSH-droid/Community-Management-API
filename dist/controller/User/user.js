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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Snowflake } = require("@theinternetfolks/snowflake");
const bcrypt = require("bcrypt");
const pool = require("../../db");
// import pool from "../../db";
// const jwt = require("jsonwebtoken");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { verifyToken } = require("../../auth/verifytoken");
exports.signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
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
        // Hashing the password
        const hashedPassword = yield bcrypt.hash(password, 10);
        const query = "INSERT INTO user (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)";
        const values = [id, name, email, hashedPassword, createdAt];
        yield pool.query(query, values);
        const accessToken = jsonwebtoken_1.default.sign({ id: id }, process.env.JWT_SECRET, {
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
//sign api
exports.signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // if the user exists in the database
        const query = "SELECT id, name, email, created_at, password FROM user WHERE email = ?";
        const [result] = yield pool.query(query, [email]);
        const user = result[0];
        // User not found or password doesn't match
        if (!user || !(yield bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Generate a new token for the user
        const tokenPayload = {
            id: user.id,
            email: user.email,
        };
        const accessToken = jsonwebtoken_1.default.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader
            ? authorizationHeader.split(" ")[1]
            : null;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized used" });
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(401).json({ error: "Invalid access token" });
            }
            const userId = decoded.id;
            // Retrieve the user details from the database using the user ID
            const query = "SELECT id, name, email, created_at FROM user WHERE id = ?";
            const [rows] = yield pool.query(query, [userId]);
            const user = rows;
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
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
