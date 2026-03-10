import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },

    phone: {
      type: String,
    },

    businessName: {
      type: String,
    },

    gstNumber: {
      type: String,
    },

    location: {
      type: String,
    },

    // ✅ PROPER MARKETPLACE APPROVAL SYSTEM
    isApproved: {
      type: Boolean,
      default: function () {
        // Vendors need admin approval
        if (this.role === "vendor") return false;
        return true; // Users & Admin auto-approved
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;