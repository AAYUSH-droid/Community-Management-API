const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../auth/verifytoken");

const {
  createCommunity,
  getAllCommunities,
  getAllMembers,
  getOwnedCommunities,
  getJoinedCommunities,
} = require("../../controller/Community/community");

router.post("/community", verifyToken, createCommunity);

router.route("/community").get(getAllCommunities);

router.route("/community/:slug/members").get(getAllMembers);

router.get("/community/me/owner", verifyToken, getOwnedCommunities);

router.get("/community/me/member", verifyToken, getJoinedCommunities);

module.exports = router;
