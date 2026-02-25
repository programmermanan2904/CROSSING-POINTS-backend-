/* ═══════════════════════════════════════════════
   personalityService.js
   Applies Veltrix tone to all responses
═══════════════════════════════════════════════ */

export const applyPersonality = (intent, response, userName = null) => {
  const name = userName ? `, ${userName}` : "";

  switch (intent) {

    case "GREETING":
      return response; // Greeting is already personalized in controller

    case "SET_NAME":
      return response; // Already personalized in controller

    case "LATEST_ORDER":
      return `⚔ Latest Crossing Retrieved${name}.\n\n${response}`;

    case "RECENT_ORDERS":
      return `📋 Crossing History${name}.\n\n${response}`;

    case "DELIVERY_TRACKING":
      return `🛰 Tracking Active${name}.\n\n${response}`;

    case "REFUND_POLICY":
      return `📜 Realm Return Code${name}.\n\n${response}`;

    case "CANCEL_ORDER":
      return `🚫 Cancellation Protocol${name}.\n\n${response}`;

    case "VENDOR_STATS":
      return `📊 Vendor Intelligence${name}.\n\n${response}`;

    case "PRODUCT_RECOMMENDATION":
      return `🎯 Gear Scan Complete${name}.\n\n${response}`;

    case "GENERAL_AI":
      return `🧠 Veltrix${name}.\n\n${response}`;

    default:
      return response;
  }
};