import express from "express";
import { body } from "express-validator";
import {
  createOrder,
  getUserOrders,
  getVendorOrders,
  updateOrderItemStatus,
  cancelOrder, // 🔥 added
} from "../controllers/orderController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= USER ROUTES ================= */

// Create Order
router.post(
  "/",
  protect,
  [
    body("items")
      .isArray({ min: 1 })
      .withMessage("Cart cannot be empty"),

    body("items.*.productId")
      .notEmpty()
      .withMessage("Product ID is required"),

    body("items.*.quantity")
      .isInt({ gt: 0 })
      .withMessage("Quantity must be greater than 0"),

    body("shippingAddress.fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required"),

    body("shippingAddress.phone")
      .matches(/^[0-9]{10}$/)
      .withMessage("Phone must be 10 digits"),

    body("shippingAddress.addressLine")
      .notEmpty()
      .withMessage("Address is required"),

    body("shippingAddress.city")
      .notEmpty()
      .withMessage("City is required"),

    body("shippingAddress.state")
      .notEmpty()
      .withMessage("State is required"),

    body("shippingAddress.postalCode")
      .matches(/^[0-9]{6}$/)
      .withMessage("Postal code must be 6 digits"),

    body("paymentMethod")
      .isIn(["card", "upi", "cod"])
      .withMessage("Invalid payment method"),
  ],
  createOrder
);

// Get Logged-in User Orders
router.get("/my", protect, getUserOrders);

// 🔥 Cancel Order
router.put(
  "/:id/cancel",
  protect,
  cancelOrder
);

/* ================= VENDOR ROUTES ================= */

// Get Vendor Orders
router.get("/vendor", protect, authorize("vendor"), getVendorOrders);

// Update Order Item Status
router.put(
  "/:orderId/item/:itemId/status",
  protect,
  authorize("vendor"),
  [
    body("status")
      .isIn(["processing", "shipped", "delivered", "cancelled"])
      .withMessage("Invalid status value"),
  ],
  updateOrderItemStatus
);

export default router;
