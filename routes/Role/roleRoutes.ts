import express, { Express, Request, Response, Router } from "express";
// const router = express.Router();
const router: Router = express.Router();

const { addRole, getRoles } = require("../../controller/Role/RoleAPI");

router.route("/role").post(addRole);
router.route("/role").get(getRoles);

module.exports = router;
// export default router;
