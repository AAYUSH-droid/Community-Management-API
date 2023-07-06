"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const { signup, signin, me } = require("../../controller/User/user");
const { verifyToken } = require("../../auth/verifytoken");
router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.get("/me", verifyToken, me);
module.exports = router;
