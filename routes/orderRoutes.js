import express from "express";
import {
  createOrder,
  getUserOrders,
  getVendorOrders,
  updateOrderItemStatus,
} from "../controllers/orderController.js";

import protect from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= USER ROUTES =================

// Create Order
router.post("/", protect, createOrder);

// Get Logged-in User Orders
router.get("/my", protect, getUserOrders);


// ================= VENDOR ROUTES =================

// Get Vendor Orders
router.get("/vendor", protect, authorize("vendor"), getVendorOrders);

// Update Order Item Status
router.put(
  "/:orderId/item/:itemId/status",
  protect,
  authorize("vendor"),
  updateOrderItemStatus
);

export default router;
