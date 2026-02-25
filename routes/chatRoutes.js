import express from "express";
import { chatHandler } from "../controllers/chatController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, chatHandler);

export default router;
