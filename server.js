/* ================== LOAD ENV FIRST (VERY IMPORTANT) ================== */
import dotenv from "dotenv";
dotenv.config();   // 🔥 MUST be before any other imports that use process.env

/* ================== IMPORTS ================== */
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Error Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

/* ================== APP INIT ================== */
const app = express();

/* ================== TRUST PROXY (IMPORTANT FOR RENDER + GOOGLE OAUTH) ================== */
app.set("trust proxy", 1);   // 👈 THIS FIXES http → https redirect issue

/* ================== MIDDLEWARE ================== */

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport
app.use(passport.initialize());

// Auth Routes
app.use("/api/auth", authRoutes);

/* ================== TEST ROUTE ================== */
app.get("/", (req, res) => {
  res.send("🚀 Backend running successfully");
});

/* ================== ROUTES ================== */
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/recommendations", recommendationRoutes);

/* ================== ERROR HANDLER ================== */
app.use(notFound);
app.use(errorHandler);

/* ================== DATABASE CONNECTION ================== */
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ================== SERVER ================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});