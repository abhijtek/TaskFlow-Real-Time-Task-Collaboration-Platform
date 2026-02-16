import { body } from "express-validator";

const userRegisterValidator = () => {
  // validation
  // everyfunc here is provided by express-validator
  // withMessage is used to display errors in case the just above method receives an error
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid formal eg: xyz@abc.com"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username cany be empty")
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be atleast 3 characters"),

    body("password").trim().notEmpty().withMessage("Password is required"),

    body("fullName").optional().trim(),
  ];
};
// these middleware and validator will be attatched routes now so go to routes

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is Required"),
  ];
};

const userChangePasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old Password is Required"),
    body("newPassword").notEmpty().withMessage("New Password Is Required"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is Required")
      .isEmail()
      .withMessage("Email is invalid- caught in validator"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [body("newPassword").isEmpty().withMessage("password is required")];
};
export {
  userRegisterValidator,
  userLoginValidator,
  userChangePasswordValidator,
  userResetForgotPasswordValidator,userForgotPasswordValidator
};
