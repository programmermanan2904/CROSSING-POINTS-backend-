import mongoose from "mongoose";

const connectDB = async () => {
  try {
  let db = await mongoose.connect(process.env.MONGO_URI);
//   let db = await mongoose.connect("mongodb://0.0.0.0/testsatabase", {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
    console.log("MongoDB connected", db);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
