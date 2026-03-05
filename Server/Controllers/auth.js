import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Admin from "../Models/Admin.js";
import Students from "../Models/Students.js";
import Teachers from "../Models/Teachers.js";
import RefreshToken from "../Models/RefreshToken.js";
import { getCookieValue } from "../utils/cookies.js";
import { sendEmail } from "../services/emailService.js";
import { isValidEmail, normalizeEmail } from "../utils/studentValidation.js";
import {
  clearAccessCookie,
  clearRefreshCookie,
  hashToken,
  rotateRefreshToken,
  setAccessCookie,
  setRefreshCookie,
  signAccessToken,
  verifyRefreshToken,
} from "../utils/authTokens.js";

const router = express.Router();

const resetTokenLifetimeMinutes = Number(
  process.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES || 30
);

const resolveClientOrigin = () => {
  const raw =
    process.env.CLIENT_ORIGINS ||
    process.env.CLIENT_URL ||
    "http://localhost:5173";
  const origins = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return origins[0] || "http://localhost:5173";
};

const buildResetLink = ({ token, role }) => {
  const origin = resolveClientOrigin();
  return `${origin}/reset-password?token=${token}&role=${role}`;
};

const findUserForReset = async (role, identifier) => {
  const trimmed = String(identifier || "").trim();
  if (!trimmed) return null;

  const normalizedEmail = normalizeEmail(trimmed);
  const emailQuery = isValidEmail(normalizedEmail)
    ? { email: normalizedEmail }
    : null;

  if (role === "admin") {
    const queries = [
      emailQuery,
      { username: trimmed },
      { phone: trimmed },
    ].filter(Boolean);
    return Admin.findOne({ $or: queries });
  }
  if (role === "teacher") {
    const queries = [emailQuery, { phone: trimmed }].filter(Boolean);
    return Teachers.findOne({ $or: queries });
  }

  const queries = [emailQuery, { phone: trimmed }, { userName: trimmed }].filter(
    Boolean
  );
  return Students.findOne({ $or: queries });
};

const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + resetTokenLifetimeMinutes * 60 * 1000
  );
  return { token, tokenHash, expiresAt };
};

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
    setAccessCookie(res, accessToken);
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
    clearAccessCookie(res);
    clearRefreshCookie(res);
    return res.status(200).json({ message: "Logged out." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Unable to logout." });
  }
});

router.post("/request-password-reset", async (req, res) => {
  try {
    const { role, identifier } = req.body || {};
    const normalizedRole = String(role || "").toLowerCase();
    if (!["admin", "teacher", "student"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (!identifier) {
      return res.status(400).json({ message: "Identifier is required." });
    }

    const user = await findUserForReset(normalizedRole, identifier);
    if (!user || !user.email) {
      return res.status(200).json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const { token, tokenHash, expiresAt } = generateResetToken();
    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    const resetLink = buildResetLink({ token, role: normalizedRole });
    const displayName = user.name || user.userName || user.username || "there";
    const subject = "Reset your password";
    const text = `Hi ${displayName},\n\nWe received a request to reset your password. Use the link below to set a new password:\n${resetLink}\n\nThis link will expire in ${resetTokenLifetimeMinutes} minutes. If you did not request this, you can ignore this email.\n\nMentor Language Institute`;
    const html = `<p>Hi ${displayName},</p>
      <p>We received a request to reset your password. Use the link below to set a new password:</p>
      <p><a href="${resetLink}">Reset password</a></p>
      <p>This link will expire in ${resetTokenLifetimeMinutes} minutes. If you did not request this, you can ignore this email.</p>
      <p>Mentor Language Institute</p>`;

    try {
      await sendEmail({ to: user.email, subject, text, html });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);
    }

    return res.status(200).json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({ message: "Unable to request password reset." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { role, token, password } = req.body || {};
    const normalizedRole = String(role || "").toLowerCase();
    if (!["admin", "teacher", "student"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required." });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const tokenHash = hashToken(String(token));
    const now = new Date();

    let user = null;
    if (normalizedRole === "admin") {
      user = await Admin.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: now },
      });
    } else if (normalizedRole === "teacher") {
      user = await Teachers.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: now },
      });
    } else {
      user = await Students.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: now },
      });
    }

    if (!user) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordTokenHash = "";
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ message: "Unable to reset password." });
  }
});

export default router;
