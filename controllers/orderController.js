import Order from "../models/order.js";
import Product from "../models/product.js";

// ================= CREATE ORDER =================
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        vendor: product.vendor, // IMPORTANT
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "cod" : "paid",
      totalAmount,
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


// ================= GET USER ORDERS =================
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


// ================= GET VENDOR ORDERS =================
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const orders = await Order.find({
      "items.vendor": vendorId,
    })
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    // Filter only vendor-specific items
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


// ================= UPDATE ORDER ITEM STATUS =================
export const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const vendorId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    item.status = status;

    await order.save();

    res.status(200).json({ message: "Status updated successfully" });

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
