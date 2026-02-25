import Order from "../models/order.js";
import Product from "../models/product.js";
import { validationResult } from "express-validator";

export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    console.log("Incoming items:", items); // Debug log

    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const productId = item.productId || item.product;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`,
        });
      }

      // Decrease stock
      product.stock -= item.quantity;

      // Increase sold count
      product.sold += item.quantity;

      await product.save();

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        vendor: product.vendor,
        quantity: item.quantity,
        price: product.price,
        status: "processing",
      });
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "cod" : "paid",
      totalAmount,
      orderStatus: "processing",
      estimatedDelivery,
    });

    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};



/* ================= GET USER ORDERS ================= */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    console.error("GET USER ORDERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET VENDOR ORDERS ================= */
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const orders = await Order.find({
      "items.vendor": vendorId,
    })
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    const vendorOrders = orders.map((order) => {
      const filteredItems = order.items.filter(
        (item) => item.vendor.toString() === vendorId.toString()
      );

      return {
        _id: order._id,
        user: order.user,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
        items: filteredItems,
      };
    });

    res.status(200).json(vendorOrders);

  } catch (error) {
    console.error("GET VENDOR ORDERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= CANCEL ORDER ================= */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.orderStatus !== "processing") {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Restore stock
    for (let item of order.items) {
      const product = await Product.findById(item.product);

      if (product) {
        product.stock += item.quantity;
        product.sold = Math.max(0, product.sold - item.quantity);
        await product.save();
      }

      // Mark item as cancelled
      item.status = "cancelled";
    }

    // 🔥 IMPORTANT: DO NOT DELETE
    order.orderStatus = "cancelled";

    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
    });

  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= VENDOR ANALYTICS ================= */
export const getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const orders = await Order.find({
      "items.vendor": vendorId,
    }).populate("items.product");

    let totalRevenue = 0;
    let processing = 0;
    let shipped = 0;
    let delivered = 0;
    let cancelled = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.vendor.toString() === vendorId.toString()) {
          const revenue = item.price * item.quantity;
          totalRevenue += revenue;

          if (item.status === "processing") processing++;
          if (item.status === "shipped") shipped++;
          if (item.status === "delivered") delivered++;
          if (item.status === "cancelled") cancelled++;
        }
      });
    });

    res.status(200).json({
      totalRevenue,
      statusBreakdown: {
        processing,
        shipped,
        delivered,
        cancelled,
      },
    });

  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE ORDER ITEM STATUS ================= */
export const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const vendorId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    const item = order.items.id(itemId);
    if (!item)
      return res.status(404).json({ message: "Item not found" });

    if (item.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    item.status = status;

    // Update overall order status
    const allStatuses = order.items.map((i) => i.status);

    if (allStatuses.every((s) => s === "delivered")) {
      order.orderStatus = "delivered";
    } else if (allStatuses.some((s) => s === "shipped")) {
      order.orderStatus = "shipped";
    } else {
      order.orderStatus = "processing";
    }

    await order.save();

    res.status(200).json({ message: "Status updated successfully" });

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

