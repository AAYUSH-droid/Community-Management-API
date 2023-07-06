import express, { Express, Request, Response } from "express";
const router = express.Router();

const { signup, signin, me } = require("../../controller/User/user");
const { verifyToken } = require("../../auth/verifytoken");

router.route("/signup").post(signup);
router.route("/signin").post(signin);

router.get("/me", verifyToken, me);

module.exports = router;
