const { Snowflake } = require("@theinternetfolks/snowflake");
const pool = require("../../db");

exports.addRole = async (req, res) => {
  try {
    const { name } = req.body;
    const id = Snowflake.generate();
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const now = new Date();
    const createdAt = now
      .toLocaleString("en-IN", options)
      .replace(/(\d+)\/(\d+)\/(\d+),/, "$3-$2-$1");
    const updatedAt = createdAt;

    const role = { id, name, created_at: createdAt, updated_at: updatedAt };

    // Save the role to the database
    const query = "INSERT INTO role SET ?";
    pool.query(query, role, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create role" });
      } else {
        const createdRole = { ...role };
        res.json({ status: true, content: { data: createdRole } });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
