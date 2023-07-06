"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const { verifyToken } = require("../../auth/verifytoken");
const { createCommunity, getAllCommunities, getAllMembers, getOwnedCommunities, getJoinedCommunities, } = require("../../controller/Community/community");
router.post("/community", verifyToken, createCommunity);
router.route("/community").get(getAllCommunities);
router.route("/community/:slug/members").get(getAllMembers);
router.get("/community/me/owner", verifyToken, getOwnedCommunities);
router.get("/community/me/member", verifyToken, getJoinedCommunities);
module.exports = router;
