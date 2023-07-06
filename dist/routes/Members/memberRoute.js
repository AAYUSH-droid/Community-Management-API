"use strict";
const express = require("express");
const router = express.Router();
const { addMember, deleteMember } = require("../../controller/Members/members");
const { verifyToken } = require("../../auth/verifytoken");
router.post("/member", verifyToken, addMember);
router.delete("/member/:memberId", verifyToken, deleteMember);
module.exports = router;
