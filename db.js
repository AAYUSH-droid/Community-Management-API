const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "aayushdb",
  database: "tif",
});

module.exports = pool;
