import jwt from "jsonwebtoken";
import User from "../models/user.js";

// 🔐 Protect Middleware (Default Export)
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      console.log("JWT_SECRET:", process.env.JWT_SECRET);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
  console.log("JWT ERROR:", error.message);
  return res.status(401).json({ message: "Token failed" });
}
};

// 🔑 Role Authorization Middleware (Named Export)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this role" });
    }
    next();
  };
};

export default protect;
