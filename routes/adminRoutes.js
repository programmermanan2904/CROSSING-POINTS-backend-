// routes/adminRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getAllUsers,
  getAllVendors,
  getAllProducts,
  getCategorySales,
  getCategoryDistribution   // ⭐ NEW
} from "../controllers/adminController.js";

const router = express.Router();

/* ================= VENDOR MANAGEMENT ================= */

// Get all pending vendors
router.get("/vendors/pending", protect, adminOnly, getPendingVendors);

// Approve vendor
router.put("/vendors/approve/:id", protect, adminOnly, approveVendor);

// Reject vendor
router.delete("/vendors/reject/:id", protect, adminOnly, rejectVendor);

// Get all approved vendors
router.get("/vendors", protect, adminOnly, getAllVendors);


/* ================= USER MANAGEMENT ================= */

// Get all normal users
router.get("/users", protect, adminOnly, getAllUsers);


/* ================= PRODUCT MANAGEMENT ================= */

// Get all products sorted by most sold
router.get("/products", protect, adminOnly, getAllProducts);

/* ================= ANALYTICS ================= */

// ⭐ Category sales for dashboard pie chart
router.get("/category-sales", protect, adminOnly, getCategorySales);

router.get("/category-distribution", protect, adminOnly, getCategoryDistribution);

export default router;