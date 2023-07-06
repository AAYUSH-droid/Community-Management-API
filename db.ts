import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "aayushdb",
  database: "tif",
});
module.exports = pool;
// export default pool;
