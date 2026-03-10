import express from "express";
import { body } from "express-validator";
import {
  registerUser,
  registerVendor,
  loginUser,
  resetPasswordManually,
} from "../controllers/userController.js";

const router = express.Router();

/* ================= USER REGISTER ================= */
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
  ],
  registerUser
);

/* ================= VENDOR REGISTER ================= */
router.post(
  "/vendors/register",
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

    body("businessName")
      .notEmpty()
      .withMessage("Business name is required"),

    body("gstNumber")
      .notEmpty()
      .withMessage("GST number is required"),

    body("location")
      .notEmpty()
      .withMessage("Location is required"),
  ],
  registerVendor
);

/* ================= LOGIN ================= */
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

/* ================= DEV RESET ================= */
router.post("/reset-password-dev", resetPasswordManually);

export default router;