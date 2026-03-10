import Product from "../models/product.js";
import { validationResult } from "express-validator";
import cloudinary from "../config/cloudinary.js";

import {
  getTrending,
  getSimilarProducts,
  getRecommendations,
} from "../services/mlService.js";

/* ================= GET ALL PRODUCTS ================= */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= GET VENDOR PRODUCTS ================= */
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= ADD PRODUCT ================= */
export const addProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "crossing_points_products",
    });

    const product = await Product.create({
      name: req.body.name,
      price: Number(req.body.price),
      category: req.body.category,
      description: req.body.description,
      stock: Number(req.body.stock),
      image: result.public_id,
      vendor: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.vendor.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    product.name = name ?? product.name;
    product.price = price ? Number(price) : product.price;
    product.category = category ?? product.category;
    product.description = description ?? product.description;
    product.stock = stock ? Number(stock) : product.stock;

    if (req.file) {
      if (product.image) {
        await cloudinary.uploader.destroy(product.image);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "crossing_points_products",
      });

      product.image = result.public_id;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.vendor.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    if (product.image) {
      await cloudinary.uploader.destroy(product.image);
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

/* ================= TRENDING PRODUCTS (ML) ================= */
export const getTrendingProducts = async (req, res) => {
  try {
    const { category, n } = req.query;

    const data = await getTrending(category, n);

    res.json(data);
  } catch (error) {
    console.error("TRENDING ERROR:", error);
    res.status(500).json({ message: "Failed to load trending products" });
  }
};

/* ================= SIMILAR PRODUCTS (ML) ================= */
export const getSimilar = async (req, res) => {
  try {
    const productId = req.params.id;

    const data = await getSimilarProducts(productId);

    res.json(data);
  } catch (error) {
    console.error("SIMILAR ERROR:", error);
    res.status(500).json({ message: "Failed to load similar products" });
  }
};

/* ================= RECOMMENDATIONS (ML) ================= */
export const getRecommended = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await getRecommendations(userId);

    res.json(data);
  } catch (error) {
    console.error("RECOMMEND ERROR:", error);
    res.status(500).json({ message: "Failed to load recommendations" });
  }
};