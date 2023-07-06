"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// const router = express.Router();
const router = express_1.default.Router();
const { addRole, getRoles } = require("../../controller/Role/RoleAPI");
router.route("/role").post(addRole);
router.route("/role").get(getRoles);
module.exports = router;
// export default router;
