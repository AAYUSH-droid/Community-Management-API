"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Hello World!");
});
//role api
const role = require("./routes/Role/roleRoutes");
app.use("/v1", role);
//user api
const USERAPI = require("./routes/User/userRoute");
app.use("/v1/auth", USERAPI);
//community api
const community = require("./routes/Community/communityRoute");
app.use("/v1", community);
//member api
const member = require("./routes/Members/memberRoute");
app.use("/v1", member);
app.listen(port, () => console.log(`Server is working on http://localhost:${port}`));
