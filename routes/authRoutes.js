import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../config/env.js";

const router = express.Router();

/* ================= GOOGLE LOGIN ================= */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

console.log("FRONTEND:", process.env.FRONTEND_URL);

/* ================= GOOGLE CALLBACK ================= */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        {
          id: req.user._id,
          role: req.user.role,
          name: req.user.name,
          email: req.user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const redirectPath =
        req.user.role === "vendor"
          ? "/vendor/dashboard"
          : "/shop";

      res.redirect(
        `${process.env.FRONTEND_URL}/oauth-success?token=${token}&redirect=${redirectPath}`
      );

    } catch (error) {
      console.error("OAuth Callback Error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  }
);

export default router;