export const detectIntent = (message) => {
  const msg = message.toLowerCase();

  // 🔹 Order status / tracking
  if (
    msg.includes("order") ||
    msg.includes("track") ||
    msg.includes("status") ||
    msg.includes("where is my") ||
    msg.includes("package")
  ) {
    return "LATEST_ORDER";
  }

  // 🔹 Order history
  if (
    msg.includes("recent") ||
    msg.includes("history") ||
    msg.includes("my orders")
  ) {
    return "RECENT_ORDERS";
  }

  // 🔹 Refund / return
  if (
    msg.includes("refund") ||
    msg.includes("return") ||
    msg.includes("money back")
  ) {
    return "REFUND_POLICY";
  }

  // 🔹 Cancel
  if (
    msg.includes("cancel") ||
    msg.includes("cancel it")
  ) {
    return "CANCEL_ORDER";
  }

  // 🔹 Delivery tracking
  if (
    msg.includes("delivery") ||
    msg.includes("arrive") ||
    msg.includes("eta") ||
    msg.includes("when will")
  ) {
    return "DELIVERY_TRACKING";
  }

  // 🔹 Product recommendation
  if (
    msg.includes("suggest") ||
    msg.includes("recommend") ||
    msg.includes("best") ||
    msg.includes("show me") ||
    msg.includes("under")
  ) {
    return "PRODUCT_RECOMMENDATION";
  }

  // 🔹 Vendor dashboard queries
  if (
    msg.includes("revenue") ||
    msg.includes("sales") ||
    msg.includes("my products") ||
    msg.includes("pending shipments") ||
    msg.includes("orders today")
  ) {
    return "VENDOR_STATS";
  }

  return "GENERAL_AI";
};