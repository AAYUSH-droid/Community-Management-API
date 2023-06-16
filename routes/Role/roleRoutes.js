const express = require("express");
const router = express.Router();

const { addRole, getRoles } = require("../../controller/Role/RoleAPI");

router.route("/role").post(addRole);
router.route("/role").get(getRoles);

module.exports = router;
