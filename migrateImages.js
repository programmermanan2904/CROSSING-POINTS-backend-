import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import cloudinary from "./config/cloudinary.js";
import Product from "./models/product.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

const migrateImages = async () => {
  const products = await Product.find({
    image: { $regex: "^/uploads" },
  });

  for (let product of products) {
    const localPath = `.${product.image}`;

    if (fs.existsSync(localPath)) {
      const result = await cloudinary.uploader.upload(localPath, {
        folder: "crossing_points_products",
      });

      product.image = result.public_id;
      await product.save();

      console.log(`Migrated: ${product.name}`);
    }
  }

  console.log("Migration completed");
  process.exit();
};

migrateImages();