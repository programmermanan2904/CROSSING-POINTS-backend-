import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://crossing-points-e-commerce-website.vercel.app"
    ],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== TEST ROUTE ================== */
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

/* ================== ROUTES ================== */
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/vendor", vendorRoutes);

/* ================== ERROR HANDLER ================== */
app.use(notFound);
app.use(errorHandler);

/* ================== DATABASE ================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

/* ================== SERVER ================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});