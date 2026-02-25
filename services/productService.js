import Product from "../models/product.js";

/* ================= SEARCH PRODUCTS (Free Text) ================= */

export const searchShopProducts = async (message) => {
  const lower = message.toLowerCase();

  const words = lower
    .split(" ")
    .filter(word => word.length > 2);

  if (!words.length) return [];

  const searchConditions = words.map(word => ({
    $or: [
      { name: { $regex: word, $options: "i" } },
      { category: { $regex: word, $options: "i" } }
    ]
  }));

  const products = await Product.find({
    $and: searchConditions,
    stock: { $gt: 0 }
  }).limit(5);

  return products;
};

/* ================= FETCH DISTINCT CATEGORIES ================= */

export const getAvailableCategories = async () => {
  const categories = await Product.distinct("category", {
    stock: { $gt: 0 }
  });

  return categories;
};

/* ================= FETCH PRODUCTS BY CATEGORY ================= */

export const getProductsByCategory = async (category) => {
  const products = await Product.find({
    category: { $regex: category, $options: "i" },
    stock: { $gt: 0 }
  }).limit(5);

  return products;
};