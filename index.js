require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//role apis -> 1. /v1/role
//             2. /v1/get
const role = require("./routes/Role/roleRoutes");
app.use("/v1", role);

//user api
const USERAPI = require("./routes/User/userRoute");
app.use("/v1/auth", USERAPI);

app.listen(port, () =>
  console.log(`Server is working on http://localhost:${port}`)
);
