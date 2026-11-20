const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!/^[a-fA-F0-9]{24}$/.test(productId || "")) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
      isDeleted: false,
    }).populate({
      path: "storeId",
      match: { status: "active" },
      select: "_id",
    });

    if (!product || !product.storeId) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unavailable",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    let cart = await Cart.findOne({
      userId: req.user.userId,
    });

    if (!cart) {
      cart = new Cart({
        userId: req.user.userId,
        items: [{ productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: "Requested quantity exceeds available stock",
          });
        }

        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getMyCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user.userId,
    }).populate({
      path: "items.productId",
      select: "name price stock status image category storeId",
      populate: {
    path: "storeId",
    select: "storeName",
  },
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!/^[a-fA-F0-9]{24}$/.test(productId || "")) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const cart = await Cart.findOne({
      userId: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
      isDeleted: false,
    }).populate({
      path: "storeId",
      match: { status: "active" },
      select: "_id",
    });

    if (!product || !product.storeId) {
      return res.status(404).json({
        success: false,
        message: "Product is unavailable",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    item.quantity = quantity;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
    });
  } catch (error) {
    console.error("Update cart quantity error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(productId || "")) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const cart = await Cart.findOne({
      userId: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user.userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  addToCart,getMyCart,updateCartQuantity,removeFromCart,clearCart,
};