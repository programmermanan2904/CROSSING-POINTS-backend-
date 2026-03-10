// services/mlService.js

import axios from "axios";
import mongoose from "mongoose";
import Product from "../models/product.js";

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL ||
  "https://crossing-points-ml-production.up.railway.app";

const AXIOS_CONFIG = {
  timeout: 5000,
};

// Resolve ML productIds to actual products from MongoDB
const resolveProducts = async (productIds) => {
  if (!productIds || productIds.length === 0) return [];

  try {
    const objectIds = productIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const products = await Product.find({
      _id: { $in: objectIds },
    });

    // Preserve order from ML service
    return productIds
      .map((id) =>
        products.find((p) => p._id.toString() === id.toString())
      )
      .filter(Boolean);

  } catch (error) {
    console.error("resolveProducts error:", error.message);
    return [];
  }
};


// Personalized recommendations
export const getRecommendations = async (userId, n = 10) => {
  try {

    const response = await axios.post(
      `${ML_SERVICE_URL}/recommend`,
      { userId, n },
      AXIOS_CONFIG
    );

    const data = response.data;

    if (data.productIds) {
      const products = await resolveProducts(data.productIds);
      return { recommendations: products };
    }

    return data;

  } catch (error) {
    console.error("getRecommendations error:", error.message);
    return { recommendations: [] };
  }
};


// Similar products
export const getSimilarProducts = async (productId, n = 6) => {
  try {

    const response = await axios.post(
      `${ML_SERVICE_URL}/similar`,
      { productId, n },
      AXIOS_CONFIG
    );

    const data = response.data;

    if (data.productIds) {
      const products = await resolveProducts(data.productIds);
      return { similar: products };
    }

    return data;

  } catch (error) {
    console.error("getSimilarProducts error:", error.message);
    return { similar: [] };
  }
};


// Trending products
export const getTrending = async (category = null, n = 10) => {
  try {

    const response = await axios.get(
      `${ML_SERVICE_URL}/trending`,
      {
        params: { category, n },
        ...AXIOS_CONFIG
      }
    );

    const data = response.data;

    console.log("ML trending raw response:", data);

    if (data.productIds) {

      const products = await resolveProducts(data.productIds);

      console.log("Resolved products:", products.length);

      return { trending: products };
    }

    return data;

  } catch (error) {
    console.error("getTrending error:", error.message);
    return { trending: [] };
  }
};


// ML service health check
export const checkMLHealth = async () => {
  try {

    const response = await axios.get(
      `${ML_SERVICE_URL}/health`,
      AXIOS_CONFIG
    );

    return response.data;

  } catch (error) {
    console.error("ML health check failed:", error.message);

    return {
      status: "down",
      error: error.message,
    };
  }
};