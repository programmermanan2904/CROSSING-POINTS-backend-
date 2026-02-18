import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

/* ================== PATH FIX (ESM Safe) ================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== STATIC FOLDER ================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================== TEST ROUTE ================== */
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

/* ================== ROUTES ================== */
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

/* ================== ERROR MIDDLEWARE (IMPORTANT) ================== */
app.use(notFound);      // 404 handler
app.use(errorHandler);  // Global error handler

/* ================== DATABASE ================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

/* ================== SERVER ================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
