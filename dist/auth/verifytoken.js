"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];
        req.token = token;
        next();
    }
    else {
        res.status(401).json({ error: "Access token is missing" });
    }
};
exports.verifyToken = verifyToken;
// import jwt, { VerifyErrors } from "jsonwebtoken";
// import express, { Request, Response, NextFunction } from "express";
// interface CustomRequest extends Request {
//   token?: string;
// }
// exports.verifyToken = (req: Request, res: Response, next: NextFunction) => {
//   const bearerHeader = req.headers["authorization"];
//   if (typeof bearerHeader !== "undefined") {
//     const bearer = bearerHeader.split(" ");
//     const token = bearer[1];
//     req.token = token;
//     next();
//   } else {
//     res.status(401).json({ error: "Access token is missing" });
//   }
// };
