// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";

// import userRoutes from "./routes/userRoutes.js";
// import productRoutes from "./routes/productRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import chatRoutes from "./routes/chatRoutes.js";
// import vendorRoutes from "./routes/vendorRoutes.js";
// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// dotenv.config();

// const app = express();

// /* ================== MIDDLEWARE ================== */
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (
//         !origin || 
//         origin.includes("localhost") ||
//         origin.includes("vercel.app")
//       ) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// app.options("*", cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// /* ================== TEST ROUTE ================== */
// app.get("/", (req, res) => {
//   res.send("Backend running successfully");
// });

// /* ================== ROUTES ================== */
// app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/vendor", vendorRoutes);

// /* ================== ERROR HANDLER ================== */
// app.use(notFound);
// app.use(errorHandler);

// /* ================== DATABASE ================== */
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.error("MongoDB Connection Failed:", err.message));
// console.log("MONGO_URI:", process.env.MONGO_URI);
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";

// Error Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load environment variables
dotenv.config();

const app = express();

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

/* ================== ERROR HANDLER ================== */
app.use(notFound);
app.use(errorHandler);

/* ================== DATABASE CONNECTION ================== */
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.error("❌ MongoDB Error:", err));
/* ================== SERVER ================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});