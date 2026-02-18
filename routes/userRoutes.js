import express from "express";
import { body } from "express-validator";
import { registerUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

// ================= REGISTER VALIDATION =================
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("phone")
      .matches(/^[0-9]{10}$/)
      .withMessage("Phone must be 10 digits"),

    body("role")
      .isIn(["user", "vendor"])
      .withMessage("Invalid role"),

    body("businessName")
      .if(body("role").equals("vendor"))
      .notEmpty()
      .withMessage("Business name is required for vendors"),

    body("gstNumber")
      .if(body("role").equals("vendor"))
      .notEmpty()
      .withMessage("GST number is required for vendors"),

    body("location")
      .if(body("role").equals("vendor"))
      .notEmpty()
      .withMessage("Location is required for vendors"),
  ],
  registerUser
);

// ================= LOGIN VALIDATION =================
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  loginUser
);

export default router;
