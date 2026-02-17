import User from "../models/user.js";


// ======================
// GET CART
// ======================
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart" });
  }
};


// ======================
// ADD TO CART
// ======================
export const addToCart = async (req, res) => {
  try {
    const { productId, name, price, image } = req.body;

    const user = await User.findById(req.user._id);

    const existingItem = user.cart.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({
        productId,
        name,
        price,
        image,
        quantity: 1,
      });
    }

    await user.save();
    res.json(user.cart);

  } catch (error) {
    res.status(500).json({ message: "Error adding to cart" });
  }
};


// ======================
// DECREASE QUANTITY
// ======================
export const decreaseQuantity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const item = user.cart.find(
      (item) => item.productId === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      user.cart = user.cart.filter(
        (i) => i.productId !== req.params.productId
      );
    }

    await user.save();
    res.json(user.cart);

  } catch (error) {
    res.status(500).json({ message: "Error decreasing quantity" });
  }
};


// ======================
// REMOVE ITEM
// ======================
export const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.productId !== req.params.productId
    );

    await user.save();
    res.json(user.cart);

  } catch (error) {
    res.status(500).json({ message: "Error removing item" });
  }
};
