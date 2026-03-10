import User from "../models/user.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

/* ================= USER REGISTER ================= */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
      provider: "local",
      isVerified: true, // users auto approved
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("REGISTER USER ERROR:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};


/* ================= VENDOR REGISTER ================= */
const registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      gstNumber,
      location,
    } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "Vendor already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "vendor",
      businessName,
      gstNumber,
      location,
      provider: "local",
      isVerified: false, // vendor must be approved by admin
    });

    return res.status(201).json({
      message: "Vendor registered successfully. Awaiting admin approval.",
    });

  } catch (error) {
    console.error("REGISTER VENDOR ERROR:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};


/* ================= LOGIN ================= */
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        message: "Please login using Google",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Password not set for this account",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    /* ================= VENDOR APPROVAL CHECK ================= */

    if (user.role === "vendor" && user.isVerified === false) {
      return res.status(403).json({
        message: "Vendor account pending admin approval",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};


/* ================= RESET PASSWORD (DEV TOOL) ================= */
const resetPasswordManually = async (req, res) => {
  try {

    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.provider = "local";

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("RESET ERROR:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export {
  registerUser,
  registerVendor,
  loginUser,
  resetPasswordManually,
};