import Order from "../models/order.js";
import Product from "../models/product.js";
import { getMemory, updateMemory, resetMemory } from "./memoryService.js";
import { searchShopProducts } from "./productService.js";

/* ================= LATEST ORDER ================= */

export const getLatestOrder = async (userId) => {
  const order = await Order.findOne({ user: userId })
    .sort({ createdAt: -1 })
    .populate("items.product");

  if (!order) {
    return "No recent crossings found.";
  }

  if (!order.items || order.items.length === 0) {
    return "Latest crossing located, but no gear attached.";
  }

  let response = "Latest Crossing Overview:\n\n";

  order.items.forEach((item, index) => {
    response += `Item ${index + 1}: ${item.product?.name || "Unknown Gear"}\n`;
    response += `Quantity: ${item.quantity}\n`;
    response += `Status: ${item.status}\n\n`;
  });

  response += `Order Status: ${order.orderStatus}`;
  response += `\nTotal Amount: ₹${order.totalAmount}`;
  response += `\nDate: ${new Date(order.createdAt).toDateString()}`;

  return response + "\n\n— Veltrix";
};

/* ================= RECENT ORDERS ================= */

export const getRecentOrders = async (userId) => {
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("items.product");

  if (!orders.length) {
    return "No recent crossings found.";
  }

  let response = "Recent Crossings:\n\n";

  orders.forEach((order, orderIndex) => {
    response += `Crossing ${orderIndex + 1}\n`;

    order.items.forEach((item) => {
      response += `• ${item.product?.name || "Unknown Gear"} (x${item.quantity})\n`;
    });

    response += `Order Status: ${order.orderStatus}\n`;
    response += `Total: ₹${order.totalAmount}\n`;
    response += `Date: ${new Date(order.createdAt).toDateString()}\n\n`;
  });

  return response.trim() + "\n\n— Veltrix";
};

/* ================= REFUND POLICY ================= */

export const refundPolicy = () => {
  return `Refund window remains active for 7 days after confirmed delivery.
Initiate the request from your Orders panel.
Verification is required before approval.

— Veltrix`;
};

/* ================= PRODUCT RECOMMENDATION ================= */

export const getProductRecommendations = async (message, userId) => {
  const products = await searchShopProducts(message);

  if (!products.length) {
    return "No matching products available in the shop.";
  }

  updateMemory(userId, {
    state: "AWAITING_SELECTION",
    actionType: "ADD_TO_CART",
    productOptions: products,
    selectedProduct: null,
  });

  let response = "Available Gear:\n\n";

  products.forEach((product, index) => {
    response += `${index + 1}. ${product.name} – ₹${product.price}\n`;
  });

  response += "\nSelect target number to proceed.";

  return response;
};
/* ================= DELIVERY STATUS ================= */

export const getDeliveryStatus = async (userId) => {
  const order = await Order.findOne({ user: userId })
    .sort({ createdAt: -1 });

  if (!order) {
    return "No active crossings found.";
  }

  if (!order.estimatedDelivery) {
    return "Delivery timeline has not been assigned yet.";
  }

  if (order.orderStatus === "cancelled") {
    return "This crossing has been cancelled.";
  }

  if (order.orderStatus === "delivered") {
    return "Crossing delivered successfully.";
  }

  const now = new Date();
  const deliveryDate = new Date(order.estimatedDelivery);

  const diffTime = deliveryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Delivery scheduled for today.\n\n— Veltrix";
  }

  return `Estimated Delivery: ${deliveryDate.toDateString()}
Time Remaining: ${diffDays} day(s)

— Veltrix`;
};

/* ================= VENDOR STATS ================= */

export const getVendorStats = async (userId, role) => {
  if (role !== "vendor") {
    return "Vendor access required.";
  }

  const orders = await Order.find({
    "items.vendor": userId,
  });

  if (!orders.length) {
    return "No sales activity detected yet.";
  }

  let totalRevenue = 0;
  let pendingShipments = 0;
  let totalSales = 0;

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.vendor.toString() === userId.toString()) {
        totalRevenue += item.price * item.quantity;
        totalSales += item.quantity;

        if (item.status === "processing" || item.status === "shipped") {
          pendingShipments++;
        }
      }
    });
  });

  return `Vendor Performance Overview:

Total Units Sold: ${totalSales}
Revenue Generated: ₹${totalRevenue}
Pending Shipments: ${pendingShipments}
Orders Involved: ${orders.length}

— Veltrix`;
};

/* ================= CANCEL ORDER ================= */

export const cancelLatestOrder = async (userId) => {
  const order = await Order.findOne({ user: userId })
    .sort({ createdAt: -1 });

  if (!order) {
    return "No active crossings found to cancel.";
  }

  if (order.orderStatus === "delivered") {
    return "Delivered crossings cannot be cancelled.";
  }

  if (order.orderStatus === "cancelled") {
    return "This crossing has already been cancelled.";
  }

  order.orderStatus = "cancelled";
  await order.save();

  resetMemory(userId);

  return `Crossing cancelled successfully.
Order ID: ${order._id}

— Veltrix`;
};

