import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import RefreshToken from "../Models/RefreshToken.js";

dotenv.config();

const accessSecrets = {
  admin: process.env.ADMIN_JWT_SECRET,
  teacher: process.env.TEACHER_JWT_SECRET,
  student: process.env.STUDENT_JWT_SECRET,
};

const refreshSecret =
  process.env.REFRESH_JWT_SECRET || process.env.ADMIN_JWT_SECRET;

const accessExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "1h";
const refreshExpiresDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
const accessCookieName = "ml_access";

const parseDurationToMs = (value) => {
  if (!value) return null;
  if (typeof value === "number") return value * 1000;
  const match = String(value).trim().match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (!Number.isFinite(amount)) return null;
  switch (unit) {
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    case "d":
      return amount * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
};

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (payload, role) => {
  const secret = accessSecrets[role];
  if (!secret) {
    throw new Error("Access token secret not configured.");
  }
  return jwt.sign(payload, secret, { expiresIn: accessExpiresIn });
};

export const verifyAccessToken = (token) => {
  const entries = Object.entries(accessSecrets).filter(([, secret]) => secret);
  for (const [role, secret] of entries) {
    try {
      const payload = jwt.verify(token, secret);
      return { payload, role: payload?.role || role };
    } catch (error) {
      // Try next secret.
    }
  }
  throw new Error("Invalid access token.");
};

export const signRefreshToken = ({ userId, role }) => {
  if (!refreshSecret) {
    throw new Error("Refresh token secret not configured.");
  }
  const tokenId = crypto.randomUUID
    ? crypto.randomUUID()
    : crypto.randomBytes(16).toString("hex");
  return jwt.sign(
    {
      sub: userId,
      role,
      jti: tokenId,
    },
    refreshSecret,
    { expiresIn: `${refreshExpiresDays}d` }
  );
};

export const createRefreshTokenRecord = async ({ userId, role }) => {
  const token = signRefreshToken({ userId, role });
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    userId,
    role,
    tokenHash,
    expiresAt,
  });

  return token;
};

export const rotateRefreshToken = async (currentRecord) => {
  const newToken = signRefreshToken({
    userId: currentRecord.userId,
    role: currentRecord.role,
  });
  const newHash = hashToken(newToken);
  const expiresAt = new Date(
    Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    userId: currentRecord.userId,
    role: currentRecord.role,
    tokenHash: newHash,
    expiresAt,
  });

  currentRecord.revokedAt = new Date();
  currentRecord.replacedByHash = newHash;
  await currentRecord.save();

  return newToken;
};

export const verifyRefreshToken = (token) => {
  if (!refreshSecret) {
    throw new Error("Refresh token secret not configured.");
  }
  return jwt.verify(token, refreshSecret);
};

export const setRefreshCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("ml_refresh", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: refreshExpiresDays * 24 * 60 * 60 * 1000,
  });
};

export const clearRefreshCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("ml_refresh", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: 0,
  });
};

export const setAccessCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = parseDurationToMs(accessExpiresIn);
  res.cookie(accessCookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api",
    maxAge: maxAge || undefined,
  });
};

export const clearAccessCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(accessCookieName, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api",
    maxAge: 0,
  });
};

export const accessCookieNameValue = accessCookieName;
