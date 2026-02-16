import jwt from "jsonwebtoken";
import { User } from "../../models/user.models.js";
import { serializeUser } from "../../middlewares/api-auth.middleware.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "7d";

const createToken = (user) =>
  jwt.sign(
    {
      _id: user._id,
      email: user.email,
      username: user.username,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );

const usernameFromEmail = (email) => email.split("@")[0].toLowerCase();

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const baseUsername = usernameFromEmail(email);
    let username = baseUsername;
    let suffix = 0;
    while (await User.findOne({ username })) {
      suffix += 1;
      username = `${baseUsername}${suffix}`;
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      username,
      fullName: name,
      isEmailVerified: true,
    });

    const token = createToken(user);
    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user);
    return res.status(200).json({ token, user: serializeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const me = async (req, res) => res.status(200).json({ user: serializeUser(req.user) });
