import express from "express";
import Admin from "../Models/Admin.js";
import Students from "../Models/Students.js";
import Teachers from "../Models/Teachers.js";
import RefreshToken from "../Models/RefreshToken.js";
import { getCookieValue } from "../utils/cookies.js";
import {
  clearRefreshCookie,
  hashToken,
  rotateRefreshToken,
  setRefreshCookie,
  signAccessToken,
  verifyRefreshToken,
} from "../utils/authTokens.js";

const router = express.Router();

const buildAccessPayload = (user, role) => {
  if (role === "admin") {
    return {
      userId: user._id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      role: String(user.role || "admin").toLowerCase(),
    };
  }
  if (role === "teacher") {
    return {
      userId: user._id,
      name: user.name,
      phone: user.phone,
      role: String(user.role || "teacher").toLowerCase(),
    };
  }
  return {
    userId: user._id,
    name: user.name,
    phone: user.phone,
    userName: user.userName,
    role: String(user.role || "student").toLowerCase(),
  };
};

const resolveUser = async (role, userId) => {
  if (role === "admin") {
    return Admin.findById(userId);
  }
  if (role === "teacher") {
    return Teachers.findById(userId);
  }
  return Students.findById(userId);
};

router.post("/refresh", async (req, res) => {
  try {
    const token = getCookieValue(req, "ml_refresh");
    if (!token) {
      return res.status(401).json({ message: "Refresh token missing." });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (error) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }
    if (!payload?.sub || !payload?.role) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }
    if (!["admin", "teacher", "student"].includes(payload.role)) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const tokenHash = hashToken(token);
    const existing = await RefreshToken.findOne({
      tokenHash,
      revokedAt: null,
    });
    if (!existing) {
      return res.status(401).json({ message: "Refresh token revoked." });
    }

    if (existing.expiresAt && existing.expiresAt <= new Date()) {
      existing.revokedAt = new Date();
      await existing.save();
      return res.status(401).json({ message: "Refresh token expired." });
    }

    if (
      String(existing.userId) !== String(payload.sub) ||
      existing.role !== payload.role
    ) {
      return res.status(401).json({ message: "Refresh token mismatch." });
    }

    const user = await resolveUser(payload.role, payload.sub);
    if (!user) {
      existing.revokedAt = new Date();
      await existing.save();
      return res.status(401).json({ message: "User not found." });
    }

    const accessPayload = buildAccessPayload(user, payload.role);
    const accessToken = signAccessToken(accessPayload, payload.role);
    const nextRefreshToken = await rotateRefreshToken(existing);
    setRefreshCookie(res, nextRefreshToken);

    return res.status(200).json({ token: accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Unable to refresh token." });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = getCookieValue(req, "ml_refresh");
    if (token) {
      const tokenHash = hashToken(token);
      await RefreshToken.findOneAndUpdate(
        { tokenHash, revokedAt: null },
        { revokedAt: new Date() }
      );
    }
    clearRefreshCookie(res);
    return res.status(200).json({ message: "Logged out." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Unable to logout." });
  }
});

export default router;
