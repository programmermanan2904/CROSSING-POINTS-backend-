/* ═══════════════════════════════════════════════
   intentEngine.js
   Single source of truth for all intent detection
═══════════════════════════════════════════════ */

export const detectIntent = (message) => {
  const lower = message.toLowerCase().trim();

  /* ── GREETING ─────────────────────────────── */
  if (/^(hi|hello|hey|sup|yo|wassup)\b/.test(lower)) {
    return { intent: "GREETING", confidence: 1 };
  }

  /* ── USER NAME ────────────────────────────── */
  if (
    /my name is\s+[a-z]+/i.test(lower) ||
    /call me\s+[a-z]+/i.test(lower) ||
    /i'm\s+[a-z]+/i.test(lower)
  ) {
    return { intent: "SET_NAME", confidence: 1 };
  }

  /* ── LATEST ORDER ─────────────────────────── */
  if (lower.includes("latest order") || lower.includes("last order")) {
    return { intent: "LATEST_ORDER", confidence: 1 };
  }

  /* ── ORDER HISTORY ────────────────────────── */
  if (
    lower.includes("my orders") ||
    lower.includes("order history") ||
    lower.includes("recent orders") ||
    lower.includes("past orders")
  ) {
    return { intent: "RECENT_ORDERS", confidence: 1 };
  }

  /* ── DELIVERY TRACKING ────────────────────── */
  if (
    lower.includes("track") ||
    lower.includes("delivery") ||
    lower.includes("where is my") ||
    lower.includes("eta") ||
    lower.includes("when will") ||
    lower.includes("arrive")
  ) {
    return { intent: "DELIVERY_TRACKING", confidence: 1 };
  }

  /* ── REFUND / RETURN ──────────────────────── */
  if (
    lower.includes("refund") ||
    lower.includes("return") ||
    lower.includes("money back")
  ) {
    return { intent: "REFUND_POLICY", confidence: 1 };
  }

  /* ── CANCEL ORDER ─────────────────────────── */
  if (lower.includes("cancel")) {
    return { intent: "CANCEL_ORDER", confidence: 1 };
  }

  /* ── VENDOR STATS ─────────────────────────── */
  if (
    lower.includes("revenue") ||
    lower.includes("my sales") ||
    lower.includes("vendor stats") ||
    lower.includes("pending shipments") ||
    lower.includes("orders today")
  ) {
    return { intent: "VENDOR_STATS", confidence: 1 };
  }

  /* ── PRODUCT RECOMMENDATION ───────────────── */
  // Only trigger when user mentions specific gear type
  // NOT for comparison or advice questions
  if (
    lower.includes("controller") ||
    lower.includes("mouse") ||
    lower.includes("keyboard") ||
    lower.includes("headset") ||
    lower.includes("monitor") ||
    lower.includes("chair") ||
    lower.includes("racing wheel") ||
    lower.includes("mousepad") ||
    lower.includes("under ₹") ||
    lower.includes("under rs")
  ) {
    return { intent: "PRODUCT_RECOMMENDATION", confidence: 1 };
  }

  // Suggest/recommend only when paired with buy intent
  if (
    (lower.includes("suggest") || lower.includes("recommend")) &&
    (lower.includes("buy") || lower.includes("get") || lower.includes("purchase"))
  ) {
    return { intent: "PRODUCT_RECOMMENDATION", confidence: 1 };
  }

  /* ── GENERAL AI FALLBACK ──────────────────── */
  return { intent: "GENERAL_AI", confidence: 0 };
};