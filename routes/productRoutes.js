import express from "express";
import { body } from "express-validator";
import {
  getAllProducts,
  getVendorProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import protect, { authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* ================= GET ALL PRODUCTS (Public) ================= */
router.get("/", getAllProducts);

/* ================= GET VENDOR PRODUCTS ================= */
router.get(
  "/vendor",
  protect,
  authorize("vendor"),
  getVendorProducts
);

/* ================= ADD PRODUCT ================= */
router.post(
  "/",
  protect,
  authorize("vendor"),
  upload.single("image"), // image required here
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ min: 2 })
      .withMessage("Product name must be at least 2 characters"),

    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number"),

    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category is required"),
  ],
  addProduct
);

/* ================= UPDATE PRODUCT ================= */
router.put(
  "/:id",
  protect,
  authorize("vendor"),
  upload.single("image"), // image optional during update
  updateProduct
);

/* ================= DELETE PRODUCT ================= */
router.delete(
  "/:id",
  protect,
  authorize("vendor"),
  deleteProduct
);

export default router;