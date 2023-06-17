const { Snowflake } = require("@theinternetfolks/snowflake");
const bcrypt = require("bcrypt");
const pool = require("../../db");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../../auth/verifytoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO user (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)";
    const values = [id, name, email, hashedPassword, createdAt];
    await pool.promise().query(query, values);

    // Generating an access token
    const accessToken = jwt.sign({ id: id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const userData = {
      id: id,
      name: name,
      email: email,
      created_at: createdAt,
    };

    const response = {
      status: true,
      content: {
        data: userData,
        meta: {
          access_token: accessToken,
        },
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//sign api
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Checking if the user exists in the database
    const query =
      "SELECT id, name, email, created_at, password FROM user WHERE email = ?";
    const result = await pool.promise().query(query, [email]);
    const user = result[0][0];

    // User not found or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a new token for the user
    const tokenPayload = {
      id: user.id,
      email: user.email,
    };
    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set the access token as a cookie
    res.cookie("access_token", accessToken, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    delete user.password;

    const response = {
      status: true,
      content: {
        data: user,
        meta: {
          access_token: accessToken,
        },
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.me = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader
      ? authorizationHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ error: "Access token is missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid access token" });
      }

      const userId = decoded.id;

      // Retrieve the user details from the database using the user ID
      const query = "SELECT id, name, email, created_at FROM user WHERE id = ?";
      const [rows] = await pool.promise().query(query, [userId]);
      const user = rows[0];

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      delete user.password;

      // Return the user details in the response
      return res.json({
        status: true,
        content: {
          data: user,
        },
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
