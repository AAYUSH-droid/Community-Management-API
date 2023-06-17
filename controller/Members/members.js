const jwt = require("jsonwebtoken");
const { Snowflake } = require("@theinternetfolks/snowflake");
const pool = require("../../db");

// Function to get the user ID from the JWT access token
function getUserIdFromToken(token) {
  const accessToken = token.startsWith("Bearer ") ? token.slice(7) : token;
  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  return decodedToken.id;
}

// POST /v1/member
exports.addMember = async (req, res) => {
  try {
    const { community, user, role } = req.body;

    const token = req.headers.authorization;

    const ownerId = getUserIdFromToken(token);

    const isCommunityAdmin = await checkIfCommunityAdmin(community, ownerId);

    if (!isCommunityAdmin) {
      return res.status(403).json({
        status: false,
        error: "NOT_ALLOWED_ACCESS",
        message: "Only Community Admin can add members.",
      });
    }

    // Generate a unique ID for the member using Snowflake
    const memberId = Snowflake.generate();

    // Add the member to the community with the specified role
    const query =
      "INSERT INTO member (id, community, user, role, created_at) VALUES (?, ?, ?, ?, ?)";
    // const createdAt = new Date().toISOString();
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
    await pool
      .promise()
      .query(query, [memberId, community, user, role, createdAt]);

    // Prepare the response
    const response = {
      status: true,
      content: {
        data: {
          id: memberId,
          community: community,
          user: user,
          role: role,
          created_at: createdAt,
        },
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to check if the user is a Community Admin
async function checkIfCommunityAdmin(communityId, ownerId) {
  const query = "SELECT owner FROM community WHERE id = ?";
  const result = await pool.promise().query(query, [communityId]);
  const owner = result[0][0].owner;

  return owner === ownerId;
}
