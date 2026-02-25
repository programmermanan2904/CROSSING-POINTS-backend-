import Order from "../models/order.js";
import Product from "../models/product.js";

/* ================= VENDOR DASHBOARD ================= */
export const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const orders = await Order.find({ "items.vendor": vendorId });
    const products = await Product.find({ vendor: vendorId });

    let totalOrders = 0;
    let totalRevenue = 0;
    let cancelledOrders = 0;
    let pendingOrders = 0;

    const monthlyRevenueMap = {};
    const statusCounts = {
      delivered: 0,
      processing: 0,
      cancelled: 0,
      shipped: 0,
    };

    orders.forEach((order) => {
      const vendorItems = order.items.filter(
        (item) => item.vendor.toString() === vendorId.toString()
      );

      if (vendorItems.length > 0) {
        totalOrders++;

        vendorItems.forEach((item) => {
          statusCounts[item.status]++;

          if (item.status === "delivered") {
            totalRevenue += item.price * item.quantity;

            const month = new Date(order.createdAt).toLocaleString("default", {
              month: "short",
            });

            monthlyRevenueMap[month] =
              (monthlyRevenueMap[month] || 0) +
              item.price * item.quantity;
          }

          if (item.status === "cancelled") cancelledOrders++;
          if (item.status === "processing") pendingOrders++;
        });
      }
    });

    const monthlyRevenue = Object.keys(monthlyRevenueMap).map((month) => ({
      month,
      revenue: monthlyRevenueMap[month],
    }));

    const topProducts = products
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const lowStockProducts = products.filter((p) => p.stock < 5);

    res.json({
      totalProducts: products.length,
      totalOrders,
      totalRevenue,
      cancelledOrders,
      pendingOrders,
      monthlyRevenue,
      statusCounts,
      topProducts,
      lowStockProducts,
    });

  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};


/* ================= UPDATE ORDER ITEM STATUS ================= */
export const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status === "delivered" && item.status !== "delivered") {
      const product = await Product.findById(item.product);

      if (product) {
        product.sold += item.quantity;
        product.stock -= item.quantity;

        if (product.stock < 0) product.stock = 0;

        await product.save();
      }
    }

    item.status = status;
    await order.save();

    res.json({ message: "Order item updated successfully" });

  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: "Failed to update order item" });
  }
};
