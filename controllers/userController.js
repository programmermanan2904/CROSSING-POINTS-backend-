import User from "../models/user.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { validationResult } from "express-validator";
import { sendOTP, verifyOTP } from "../utils/twilio.js";

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const {
      name,
      email,
      password,
      phone,
      role,
      businessName,
      gstNumber,
      location,
    } = req.body;

    // 🔹 Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 🔹 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Create user (NOT VERIFIED initially)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      businessName: role === "vendor" ? businessName : undefined,
      gstNumber: role === "vendor" ? gstNumber : undefined,
      location: role === "vendor" ? location : undefined,
      isVerified: false,
    });

    // 🔐 Send OTP using Twilio
    await sendOTP(phone);

    res.status(201).json({
      message: "OTP sent to your phone. Please verify.",
      phone: user.phone,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 🔐 Block login if not verified
    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     message: "Please verify your phone number first",
    //   });
    // }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// // ================= VERIFY OTP =================
// const verifyUserOTP = async (req, res) => {
//   const { phone, code } = req.body;

//   try {
//     const verification = await verifyOTP(phone, code);

//     if (verification.status === "approved") {
//       const user = await User.findOne({ phone });

//       if (!user) {
//         return res.status(404).json({
//           message: "User not found",
//         });
//       }

//       user.isVerified = true;
//       await user.save();

//       return res.status(200).json({
//         message: "Phone verified successfully",
//       });
//     } else {
//       return res.status(400).json({
//         message: "Invalid OTP",
//       });
//     }

//   } catch (error) {
//     console.error("VERIFY OTP ERROR:", error);
//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

export { registerUser, loginUser };