/* ═══════════════════════════════════════════════
   chatController.js
   Full pipeline: state machine → intent → AI → MongoDB
═══════════════════════════════════════════════ */

import { detectIntent } from "../services/intentEngine.js";
import { generateAIResponse } from "../services/aiService.js";
import { applyPersonality } from "../services/personalityService.js";
import {
  getLatestOrder,
  getRecentOrders,
  refundPolicy,
  getDeliveryStatus,
  getVendorStats,
  cancelLatestOrder,
  getProductRecommendations,
} from "../services/userSupportService.js";

import {
  getAvailableCategories,
  getProductsByCategory,
} from "../services/productService.js";

import {
  getMemory,
  updateMemory,
  resetMemory,
  addToHistory,
  getHistoryContext,
} from "../services/memoryService.js";

import Chat from "../models/chat.js";

/* ═══════════════════════════════════════════════
   HELPER — Save message pair to MongoDB
═══════════════════════════════════════════════ */

const saveToDB = async (userId, userMessage, botReply) => {
  try {
    let chat = await Chat.findOne({ user: userId });

    if (!chat) {
      chat = new Chat({ user: userId, messages: [] });
    }

    chat.messages.push(
      { role: "user", content: userMessage, timestamp: new Date() },
      { role: "bot", content: botReply, timestamp: new Date() }
    );

    if (chat.messages.length > 100) {
      chat.messages = chat.messages.slice(-100);
    }

    await chat.save();
  } catch (err) {
    console.error("⚠ Chat DB save failed:", err.message);
  }
};

/* ═══════════════════════════════════════════════
   HELPER — Detect if user started a new query
═══════════════════════════════════════════════ */

const isNewQuery = (lower) => {
  const newQuerySignals = [
    "show", "find", "search", "looking for", "want",
    "need", "get me", "what about", "how about",
    "controller", "mouse", "keyboard", "headset",
    "monitor", "chair", "ps5", "xbox", "suggest",
    "recommend", "best", "budget", "under",
    "order", "track", "refund", "cancel", "delivery",
    "hi", "hello", "hey",
    "what else", "what can", "how can", "guide",
    "help", "categories", "category", "something",
    "racing", "wheels", "pedals", "vr", "sets",
    "mousepad", "headphones", "more",
  ];

  return newQuerySignals.some(signal => lower.includes(signal));
};

/* ═══════════════════════════════════════════════
   MAIN HANDLER
═══════════════════════════════════════════════ */

export const chatHandler = async (req, res) => {
  try {
    const message = req.body?.message;
    const userId = req.user?._id;
    const role = req.user?.role;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const lower = message.toLowerCase().trim();

    // First read of memory
    const memory = getMemory(userId);

    /* ═══════════════════════════════════════════
       ESCAPE HATCHES
    ═══════════════════════════════════════════ */

    if (
      memory.state === "AWAITING_CATEGORY_SELECTION" &&
      !/^\d+$/.test(lower) &&
      !memory.categoryOptions?.some(cat =>
        lower.includes(cat.toLowerCase())
      ) &&
      isNewQuery(lower)
    ) {
      resetMemory(userId);
    }

    if (
      memory.state === "AWAITING_PRODUCT_SELECTION" &&
      !/^\d+$/.test(lower) &&
      isNewQuery(lower)
    ) {
      resetMemory(userId);
    }

    if (
      memory.state === "AWAITING_CONFIRMATION" &&
      !lower.includes("add") &&
      !lower.includes("buy") &&
      isNewQuery(lower)
    ) {
      resetMemory(userId);
    }

    // ✅ Re-read memory after potential reset — fixes stale state bug
    const currentMemory = getMemory(userId);

    /* ═══════════════════════════════════════════
       STATE MACHINE
    ═══════════════════════════════════════════ */

    /* ── AWAITING CATEGORY SELECTION ─────────── */
    if (currentMemory.state === "AWAITING_CATEGORY_SELECTION") {
      const categories = currentMemory.categoryOptions || [];

      let selectedCategory = null;

      if (/^\d+$/.test(lower)) {
        const num = parseInt(lower);
        if (num > 0 && num <= categories.length) {
          selectedCategory = categories[num - 1];
        }
      }

      if (!selectedCategory) {
        selectedCategory = categories.find(cat =>
          lower.includes(cat.toLowerCase())
        );
      }

      if (!selectedCategory) {
        return res.json({
          success: true,
          reply: `Invalid selection. Choose a number between 1 and ${categories.length} or type a category name.`,
        });
      }

      const products = await getProductsByCategory(selectedCategory);

      if (!products.length) {
        resetMemory(userId);
        return res.json({
          success: true,
          reply: `No products available in ${selectedCategory} currently.`,
        });
      }

      updateMemory(userId, {
        state: "AWAITING_PRODUCT_SELECTION",
        productOptions: products,
        selectedCategory,
      });

      let reply = `${selectedCategory} available:\n\n`;
      products.forEach((p, i) => {
        reply += `${i + 1}. ${p.name} — ₹${p.price}\n`;
      });
      reply += `\nSelect a number to proceed.`;

      await saveToDB(userId, message, reply);
      return res.json({ success: true, reply });
    }

    /* ── AWAITING PRODUCT SELECTION ───────────── */
    if (currentMemory.state === "AWAITING_PRODUCT_SELECTION") {
      const products = currentMemory.productOptions || [];

      if (!/^\d+$/.test(lower)) {
        return res.json({
          success: true,
          reply: `Please enter a number between 1 and ${products.length}, or ask something new.`,
        });
      }

      const num = parseInt(lower);

      if (num < 1 || num > products.length) {
        return res.json({
          success: true,
          reply: `Please select a number between 1 and ${products.length}.`,
        });
      }

      const selectedProduct = products[num - 1];

      updateMemory(userId, {
        state: "AWAITING_CONFIRMATION",
        selectedProduct,
      });

      const reply = `You selected:\n\n🎮 ${selectedProduct.name}\n💰 ₹${selectedProduct.price}\n\nType "add to cart" or "buy now".`;

      await saveToDB(userId, message, reply);
      return res.json({ success: true, reply });
    }

    /* ── AWAITING CONFIRMATION ────────────────── */
    if (currentMemory.state === "AWAITING_CONFIRMATION") {
      const selectedProduct = currentMemory.selectedProduct;

      if (!selectedProduct) {
        resetMemory(userId);
        return res.json({
          success: true,
          reply: "Something went wrong. Please start again.",
        });
      }

      if (lower.includes("add")) {
        resetMemory(userId);
        const reply = `✅ ${selectedProduct.name} added to cart successfully!`;
        await saveToDB(userId, message, reply);
        return res.json({ success: true, reply });
      }

      if (lower.includes("buy")) {
        resetMemory(userId);
        const reply = `🚀 Redirecting to checkout for ${selectedProduct.name}.`;
        await saveToDB(userId, message, reply);
        return res.json({ success: true, reply });
      }

      return res.json({
        success: true,
        reply: `Please type "add to cart" or "buy now".`,
      });
    }

    /* ═══════════════════════════════════════════
       VAGUE COMMERCE TRIGGER
    ═══════════════════════════════════════════ */

    const vagueCommerceTriggers = [
      "products", "items", "gear", "catalog",
      "variety", "what do you have", "show all",
      "show me", "what you have", "what do u have",
      "categories", "category", "chategories",
      "browse", "explore", "list", "available",
    ];

    if (vagueCommerceTriggers.some(t => lower.includes(t))) {
      const categories = await getAvailableCategories();

      if (!categories.length) {
        return res.json({
          success: true,
          reply: "No products are currently available.",
        });
      }

      // ✅ User named a specific category — skip list, go straight to products
      const specificCategory = categories.find(cat =>
        lower.includes(cat.toLowerCase())
      );

      if (specificCategory) {
        const products = await getProductsByCategory(specificCategory);

        if (!products.length) {
          return res.json({
            success: true,
            reply: `No products available in ${specificCategory} currently.`,
          });
        }

        updateMemory(userId, {
          state: "AWAITING_PRODUCT_SELECTION",
          productOptions: products,
          selectedCategory: specificCategory,
        });

        let reply = `${specificCategory} available:\n\n`;
        products.forEach((p, i) => {
          reply += `${i + 1}. ${p.name} — ₹${p.price}\n`;
        });
        reply += `\nSelect a number to proceed.`;

        await saveToDB(userId, message, reply);
        return res.json({ success: true, reply });
      }

      // No specific category — show full list
      updateMemory(userId, {
        state: "AWAITING_CATEGORY_SELECTION",
        categoryOptions: categories,
      });

      let reply = "Available categories:\n\n";
      categories.forEach((cat, i) => {
        reply += `${i + 1}. ${cat}\n`;
      });
      reply += "\nSelect a number or type a category name.";

      await saveToDB(userId, message, reply);
      return res.json({ success: true, reply });
    }

    /* ═══════════════════════════════════════════
       INTENT ROUTING
    ═══════════════════════════════════════════ */

    const { intent, confidence } = detectIntent(message);

    addToHistory(userId, "user", message);

    let reply = "";

    switch (intent) {

      case "GREETING": {
        const name = currentMemory.userName;
        reply = name
          ? `Welcome back, ${name}. State your objective.`
          : `Veltrix online. State your objective, gamer.`;
        break;
      }

      case "SET_NAME": {
        const nameMatch = message.match(
          /(?:my name is|call me|i'm)\s+([a-zA-Z]+)/i
        );
        if (nameMatch) {
          const name = nameMatch[1];
          updateMemory(userId, { userName: name });
          reply = `Noted, ${name}. How can I assist you today?`;
        } else {
          reply = `Couldn't catch that. Try: "My name is [name]".`;
        }
        break;
      }

      case "LATEST_ORDER":
        reply = await getLatestOrder(userId);
        break;

      case "RECENT_ORDERS":
        reply = await getRecentOrders(userId);
        break;

      case "DELIVERY_TRACKING":
        reply = await getDeliveryStatus(userId);
        break;

      case "REFUND_POLICY":
        reply = refundPolicy();
        break;

      case "CANCEL_ORDER":
        reply = await cancelLatestOrder(userId);
        break;

      case "VENDOR_STATS":
        reply = await getVendorStats(userId, role);
        break;

      case "PRODUCT_RECOMMENDATION":
        reply = await getProductRecommendations(message, userId);
        break;

      default: {
        const context = getHistoryContext(userId);
        reply = await generateAIResponse(message, context, currentMemory.userName);
        break;
      }
    }

    addToHistory(userId, "bot", reply);

    const finalReply = applyPersonality(intent, reply, currentMemory.userName);

    await saveToDB(userId, message, finalReply);

    return res.json({ success: true, intent, confidence, reply: finalReply });

  } catch (error) {
    console.error("❌ Chat Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};