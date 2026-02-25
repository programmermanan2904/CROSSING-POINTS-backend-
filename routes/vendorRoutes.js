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
  authorize("vendor"), // Only vendor role allowed
  getVendorDashboard
);

export default router;
