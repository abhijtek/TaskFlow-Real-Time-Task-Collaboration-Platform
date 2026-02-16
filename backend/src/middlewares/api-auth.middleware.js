import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret";

const tokenFromRequest = (req) => {
  const authHeader = req.header("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return req.cookies?.accessToken || null;
};

export const requireApiAuth = async (req, res, next) => {
  try {
    const token = tokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Not authenticated" });
  }
};

export const serializeUser = (user) => ({
  _id: user._id,
  name: user.fullName || user.username,
  email: user.email,
  avatar: user.avatar?.url || user.avatar || null,
});
