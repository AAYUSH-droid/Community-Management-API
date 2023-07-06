"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.addMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { community, user, role } = req.body;
        const token = req.headers.authorization;
        const ownerId = getUserIdFromToken(token);
        const isCommunityAdmin = yield checkIfCommunityAdmin(community, ownerId);
        if (!isCommunityAdmin) {
            return res.status(403).json({
                status: false,
                error: "NOT_ALLOWED_ACCESS",
                message: "Only Community Admin can add members.",
            });
        }
        const memberId = Snowflake.generate();
        const query = "INSERT INTO member (id, community, user, role, created_at) VALUES (?, ?, ?, ?, ?)";
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
        yield pool
            .promise()
            .query(query, [memberId, community, user, role, createdAt]);
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
// Function to check if the user is a Community Admin
function checkIfCommunityAdmin(communityId, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = "SELECT owner FROM community WHERE id = ?";
        const result = yield pool.promise().query(query, [communityId]);
        const owner = result[0][0].owner;
        return owner === ownerId;
    });
}
//delete api
exports.deleteMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberId = req.params.memberId;
        const token = req.headers.authorization;
        const userId = getUserIdFromToken(token);
        const communityId = yield getCommunityIdFromMemberId(memberId);
        const isCommunityAdmin = yield checkIfCommunityAdmin(communityId, userId);
        if (!isCommunityAdmin) {
            return res.status(403).json({ error: "NOT_ALLOWED_ACCESS" });
        }
        const deleteQuery = "DELETE FROM member WHERE id = ?";
        yield pool.promise().query(deleteQuery, [memberId]);
        return res.json({ status: true });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
function getCommunityIdFromMemberId(memberId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = "SELECT community FROM member WHERE id = ?";
        const result = yield pool.promise().query(query, [memberId]);
        if (result[0].length > 0) {
            return result[0][0].community;
        }
        else {
            throw new Error("Member not found");
        }
    });
}
