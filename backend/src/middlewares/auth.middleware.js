import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
// out plan is to intercept request and attach this request body to our respose to further middleware or server
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const token = req.cookies?.accessToken || bearerToken;
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!user) {
       throw new ApiError(401, "AInvalid Access Token");
    }
    req.user = user;
    next();
  } 
  catch (error) {
    console.log(error)
    throw new ApiError(401, "BInalid Access Token");
  }
});
