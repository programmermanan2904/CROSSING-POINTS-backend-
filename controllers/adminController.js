// controllers/adminController.js

import User from "../models/user.js";
import Product from "../models/product.js";

/* ================= GET PENDING VENDORS ================= */

export const getPendingVendors = async (req, res) => {
  try {

    const vendors = await User.find({
      role: "vendor",
      isApproved: false,
    }).select("-password");

    res.status(200).json(vendors);

  } catch (error) {

    console.error("GET PENDING VENDORS ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ================= APPROVE VENDOR ================= */

export const approveVendor = async (req, res) => {
  try {

    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({
        message: "Vendor not found",
      });
    }

    vendor.isApproved = true;

    await vendor.save();

    res.status(200).json({
      message: "Vendor approved successfully",
    });

  } catch (error) {

    console.error("APPROVE VENDOR ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ================= REJECT VENDOR ================= */

export const rejectVendor = async (req, res) => {
  try {

    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({
        message: "Vendor not found",
      });
    }

    await vendor.deleteOne();

    res.status(200).json({
      message: "Vendor rejected and removed",
    });

  } catch (error) {

    console.error("REJECT VENDOR ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ================= GET ALL USERS ================= */

export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find({
      role: "user",
    }).select("-password");

    res.status(200).json(users);

  } catch (error) {

    console.error("GET USERS ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ================= GET ALL APPROVED VENDORS ================= */

export const getAllVendors = async (req, res) => {
  try {

    const vendors = await User.find({
      role: "vendor",
      isApproved: true,
    }).select("-password");

    res.status(200).json(vendors);

  } catch (error) {

    console.error("GET VENDORS ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ================= GET ALL PRODUCTS ================= */

export const getAllProducts = async (req, res) => {
  try {

    const products = await Product
      .find()
      .populate("vendor", "businessName")
      .sort({ sold: -1 });

    res.json(products);

  } catch (error) {

    console.error("ADMIN PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ================= CATEGORY SALES ANALYTICS ================= */

export const getCategorySales = async (req, res) => {
  try {

    const categorySales = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalSold: { $sum: "$sold" }
        }
      },
      {
        $sort: { totalSold: -1 }
      }
    ]);

    res.json(categorySales);

  } catch (error) {

    console.error("CATEGORY SALES ERROR:", error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const getCategoryDistribution = async (req, res) => {
  try {

    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(categories);

  } catch (error) {

    console.error("Category Distribution Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};