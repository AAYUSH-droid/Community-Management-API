const express = require("express");
const router = express.Router();

const { addMember } = require("../../controller/Members/members");
const { verifyToken } = require("../../auth/verifytoken");

router.post("/member", verifyToken, addMember);

module.exports = router;
