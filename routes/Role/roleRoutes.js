const express = require("express");
const router = express.Router();

const { addRole } = require("../../controller/Role/RoleAPI");

router.route("/role").post(addRole);

module.exports = router;
