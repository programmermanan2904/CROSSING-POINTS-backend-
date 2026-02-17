import express from "express";
import {
  getAllProducts,
  getVendorProducts,
  addProduct,
  deleteProduct
} from "../controllers/productController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* GET ALL PRODUCTS (Public) */
router.get("/", getAllProducts);

/* GET VENDOR PRODUCTS */
router.get("/vendor", protect, authorize("vendor"), getVendorProducts);

/* ADD PRODUCT */
router.post(
  "/",
  protect,
  authorize("vendor"),
  upload.single("image"),
  addProduct
);

/* DELETE PRODUCT */
router.delete(
  "/:id",
  protect,
  authorize("vendor"),
  deleteProduct
);

export default router;
