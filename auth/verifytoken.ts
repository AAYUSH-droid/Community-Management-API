import express, { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";

interface CustomRequest extends Request {
  token?: string;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    req.token = token;
    next();
  } else {
    res.status(401).json({ error: "Access token is missing" });
  }
};

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
