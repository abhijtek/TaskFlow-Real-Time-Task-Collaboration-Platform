import { validationResult } from "express-validator";
import {ApiError} from "../utils/api-error.js";

// give you a file extract error from it
// every middleware will take req res and a next
export const validate = (req, res, next) => {
  const errors = validationResult(req); //check for errors
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
  throw new ApiError(422, "Received data is not valid", extractedErrors);
};
