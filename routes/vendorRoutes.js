import express from "express";
import protect, { authorize } from "../middleware/authMiddleware.js";
import { 
  getVendorDashboard, 
  updateOrderItemStatus 
} from "../controllers/vendorController.js";

const router = express.Router();

/* ================== VENDOR DASHBOARD ================== */
router.get(
  "/dashboard",
  protect,
  authorize("vendor"),
  getVendorDashboard
);

/* ================== UPDATE ORDER ITEM STATUS ================== */
router.put(
  "/update-status",
  protect,
  authorize("vendor"),
  updateOrderItemStatus
);

export default router;