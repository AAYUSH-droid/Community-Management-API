const jwt = require("jsonwebtoken");
const { Snowflake } = require("@theinternetfolks/snowflake");
const pool = require("../../db");
import express, { Request, Response } from "express";

//Post api to create a community
exports.createCommunity = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const slug = generateSlug(name);
    const accessToken = req.headers.authorization;
    const ownerId = getUserIdFromToken(<string>accessToken);

    const communityId = Snowflake.generate();

    const query =
      "INSERT INTO community (id, name, slug, owner, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())";
    await pool.query(query, [communityId, name, slug, ownerId]);

    const getCommunityQuery = "SELECT * FROM community WHERE id = ?";
    const result = await pool.query(getCommunityQuery, [communityId]);
    const community = result[0][0];

    const response = {
      status: true,
      content: {
        data: community,
      },
    };
    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

function generateSlug(name: String): string {
  return name.toLowerCase().replace(/\s/g, "");
}

// Function to get the user ID from the JWT access token(imp)
function getUserIdFromToken(token: String): string {
  const accessToken = token.startsWith("Bearer ") ? token.slice(7) : token;
  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  return decodedToken.id;
}

// Defining the Community interface
interface Community {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  owner_name: string;
  created_at: string;
  updated_at: string;
  owner: string;
}
//get all communities
exports.getAllCommunities = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10; //max communities per page

    const countQuery = "SELECT COUNT(*) AS total FROM community";
    const countResult = await pool.query(countQuery);
    const totalCommunities = countResult[0][0].total;

    const totalPages = Math.ceil(totalCommunities / limit);
    const currentPage = Math.min(page, totalPages);

    // communities for the current page
    const offset = (currentPage - 1) * limit;
    const query = `
    SELECT c.id, c.name, c.slug, c.created_at, c.updated_at, u.id AS owner_id, u.name AS owner_name
    FROM community c
    INNER JOIN user u ON c.owner = u.id
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `;
    const result = await pool.query(query, [limit, offset]);
    const communities = result[0];

    const response = {
      status: true,
      content: {
        meta: {
          total: totalCommunities,
          pages: totalPages,
          page: currentPage,
        },

        data: communities.map((community: Community) => ({
          id: community.id,
          name: community.name,
          slug: community.slug,
          owner: {
            id: community.owner_id,
            name: community.owner_name,
          },
          created_at: community.created_at,
          updated_at: community.updated_at,
        })),
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

async function getRoleId(roleName: string) {
  const roleQuery = "SELECT id FROM role WHERE name = ?";
  const roleResult = await pool.query(roleQuery, [roleName]);
  if (roleResult[0].length > 0) {
    return roleResult[0][0].id;
  } else {
    return null;
  }
}

//Defining the member interface
interface Member {
  id: number;
  community: string;
  user: number;
  user_name: string;
  role: number;
  role_name: string;
  created_at: string;
}

//get all members of a community
exports.getAllMembers = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10; // Number of members to fetch per page

    const communityQuery = "SELECT id, owner FROM community WHERE slug = ?";
    const communityResult = await pool.query(communityQuery, [slug]);
    const communityId = communityResult[0][0].id;
    const ownerId = communityResult[0][0].owner;

    const countQuery =
      "SELECT COUNT(*) AS total FROM member WHERE community = ?";
    const countResult = await pool.query(countQuery, [communityId]);
    const totalMembers = countResult[0][0].total;

    const totalPages = Math.ceil(totalMembers / limit);
    const currentPage = Math.min(page, totalPages);

    const offset = Math.max((currentPage - 1) * limit, 0);
    const query = `
      SELECT m.id, m.community, m.user, m.role, m.created_at, u.name AS user_name, r.name AS role_name
      FROM member m
      INNER JOIN user u ON m.user = u.id
      INNER JOIN role r ON m.role = r.id
      WHERE m.community = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const result = await pool.query(query, [communityId, limit, offset]);
    const members = result[0];

    const ownerQuery = "SELECT name FROM user WHERE id = ?";
    const ownerResult = await pool.query(ownerQuery, [ownerId]);
    const ownerName = ownerResult[0][0].name;

    const roleForAdmin = "select id FROM role where name = ?";
    const roleForAdminResult = await pool.query(roleForAdmin, [
      "Community Admin",
    ]);
    const AdminID = roleForAdminResult[0][0].id;

    const ownerQuery2CR_AT = `
    SELECT u.created_at
    FROM community c
    JOIN user u ON c.owner = u.id
    WHERE c.slug = ?
  `;
    const ownerResult1 = await pool.query(ownerQuery2CR_AT, [slug]);
    const createdAt = ownerResult1[0][0].created_at;

    const communityAdmin = {
      id: ownerId,
      community: communityId,
      user: {
        id: ownerId,
        name: ownerName,
      },
      role: {
        // id: "Community Admin",
        id: AdminID,
        name: "Community Admin",
      },
      created_at: createdAt,
    };

    const response = {
      status: true,
      content: {
        meta: {
          total: totalMembers + 1, //+1 for admin
          pages: totalPages,
          page: currentPage,
        },
        data: [
          communityAdmin,
          ...members.map((member: Member) => ({
            id: member.id,
            community: member.community,
            user: {
              id: member.user,
              name: member.user_name,
            },
            role: {
              id: member.role,
              name: member.role_name,
            },
            created_at: member.created_at,
          })),
        ],
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//get my owned communities
exports.getOwnedCommunities = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;

    const userId = getUserIdFromToken(req.headers.authorization as string);

    //total number of communities owned by the user
    const countQuery =
      "SELECT COUNT(*) AS total FROM community WHERE owner = ?";
    const countResult = await pool.query(countQuery, [userId]);
    const totalCommunities = countResult[0][0].total;

    // Calculate pagination values
    const totalPages = Math.ceil(totalCommunities / limit);
    const currentPage = Math.min(page, totalPages);

    // Retrieve the communities for the current page
    const offset = Math.max((currentPage - 1) * limit, 0);
    const query = `
      SELECT id, name, slug, owner, created_at, updated_at
      FROM community
      WHERE owner = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    const communities = result[0];

    // Format the response
    const response = {
      status: true,
      content: {
        meta: {
          total: totalCommunities,
          pages: totalPages,
          page: currentPage,
        },
        data: communities.map((community: Community) => ({
          id: community.id,
          name: community.name,
          slug: community.slug,
          owner: community.owner,
          created_at: community.created_at,
          updated_at: community.updated_at,
        })),
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//get my joined communities
exports.getJoinedCommunities = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    const userId = getUserIdFromToken(token as string);
    // console.log(userId);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = 10; // Number of communities to fetch per page

    // Get the total number of joined communities
    const countQuery = "SELECT COUNT(*) AS total FROM member WHERE user = ?";
    const countResult = await pool.query(countQuery, [userId]);
    const totalCommunities = countResult[0][0].total;

    const totalPages = Math.ceil(totalCommunities / limit);
    const currentPage = Math.min(page, totalPages);

    const offset = Math.max((currentPage - 1) * limit, 0);
    const query = `
      SELECT c.id, c.name, c.slug, u.id AS owner_id, u.name AS owner_name, c.created_at, c.updated_at
      FROM member m
      INNER JOIN community c ON m.community = c.id
      INNER JOIN user u ON c.owner = u.id
      WHERE m.user = ?
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    const communities = result[0];

    const response = {
      status: true,
      content: {
        meta: {
          total: totalCommunities,
          pages: totalPages,
          page: currentPage,
        },
        data: communities.map((community: Community) => ({
          id: community.id,
          name: community.name,
          slug: community.slug,
          owner: {
            id: community.owner_id,
            name: community.owner_name,
          },
          created_at: community.created_at,
          updated_at: community.updated_at,
        })),
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unauthorized user" });
  }
};
