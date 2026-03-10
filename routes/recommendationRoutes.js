// routes/recommendationRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getRecommendations,
  getSimilarProducts,
  getTrending,
  checkMLHealth,
} from "../services/mlService.js";

const router = express.Router();

// GET /api/recommendations/for-you
// Returns personalized recommendations for logged in user
router.get("/for-you", protect, async (req, res) => {
  try {
    const data = await getRecommendations(req.user._id.toString());
    res.json(data);
  } catch (err) {
    console.error("ML Service error:", err.message);
    res.status(503).json({ message: "Recommendation service unavailable" });
  }
});

// POST /api/recommendations/similar
// Returns similar products for a given productId
router.post("/similar", async (req, res) => {
  try {
    const { productId, n } = req.body;
    if (!productId) return res.status(400).json({ message: "productId required" });
    const data = await getSimilarProducts(productId, n);
    res.json(data);
  } catch (err) {
    console.error("ML Service error:", err.message);
    res.status(503).json({ message: "Recommendation service unavailable" });
  }
});

// GET /api/recommendations/trending
// Returns trending products, optionally filtered by category
router.get("/trending", async (req, res) => {
  try {
    console.log("in trending api", req.query)
    const { category, n } = req.query;
    const data = await getTrending(category, n);
    res.json(data);
  } catch (err) {
    console.error("ML Service error:", err.message, err.response?.data);
    res.status(503).json({ message: "Recommendation service unavailable" });
  }
});

// GET /api/recommendations/health
router.get("/health", async (req, res) => {
  try {
    const data = await checkMLHealth();
    res.json(data);
  } catch (err) {
    res.status(503).json({ message: "ML Service is down" });
  }
});

export default router;