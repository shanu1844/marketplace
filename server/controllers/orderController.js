const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Store = require("../models/Store");

const placeOrder = async (req, res) => {
  const { shippingAddress } = req.body;

  const requiredFields = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "pincode",
  ];

  if (
    !shippingAddress ||
    requiredFields.some(
      (field) =>
        typeof shippingAddress[field] !== "string" ||
        !shippingAddress[field].trim(),
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Complete shipping address is required",
    });
  }

  let session;

  try {
    session = await mongoose.startSession();

    let order;

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({
        userId: req.user.userId,
      }).session(session);

      if (!cart || cart.items.length === 0) {
        const error = new Error("Your cart is empty");
        error.statusCode = 400;
        throw error;
      }

      const orderItems = [];
      let totalAmount = 0;

      for (const item of cart.items) {
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          const error = new Error("Invalid cart quantity");
          error.statusCode = 400;
          throw error;
        }
        const product = await Product.findOne({
          _id: item.productId,
          status: "active",
          isDeleted: false,
        }).session(session);

        if (!product) {
          const error = new Error("A product in your cart is unavailable");
          error.statusCode = 400;
          throw error;
        }

        const store = await Store.findOne({
          _id: product.storeId,
          status: "active",
        }).session(session);

        if (!store) {
          const error = new Error("A product's store is unavailable");
          error.statusCode = 400;
          throw error;
        }

        const stockUpdated = await Product.updateOne(
          {
            _id: product._id,
            status: "active",
            isDeleted: false,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session },
        );

        if (stockUpdated.modifiedCount !== 1) {
          const error = new Error(
            `Insufficient or changed stock for ${product.name}`,
          );
          error.statusCode = 409;
          throw error;
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: product._id,
          storeId: store._id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
        });
      }

      const [createdOrder] = await Order.create(
        [
          {
            buyerId: req.user.userId,
            items: orderItems,
            totalAmount,
            shippingAddress: {
              fullName: shippingAddress.fullName.trim(),
              phone: shippingAddress.phone.trim(),
              addressLine: shippingAddress.addressLine.trim(),
              city: shippingAddress.city.trim(),
              state: shippingAddress.state.trim(),
              pincode: shippingAddress.pincode.trim(),
            },
          },
        ],
        { session },
      );

      order = createdOrder;

      cart.items = [];
      await cart.save({ session });
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      buyerId: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      buyerId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    console.error("Get order details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const cancelOrder = async (req, res) => {
  let session;

  try {
    const { orderId, itemId } = req.params;

    session = await mongoose.startSession();

    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: orderId,
        buyerId: req.user.userId,
      }).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      // Find the specific item inside this order.
      const item = order.items.id(itemId);

      if (!item) {
        const error = new Error("Order item not found");
        error.statusCode = 404;
        throw error;
      }

      // Only items that are still placed can be cancelled.
      if (item.status !== "placed") {
        const error = new Error("Only placed items can be cancelled");
        error.statusCode = 400;
        throw error;
      }

      // Restore stock for this item only.
      const stockResult = await Product.updateOne(
        { _id: item.productId,
          isDeleted: false,
         },
        { $inc: { stock: item.quantity } },
        { session },
      );

      if (stockResult.matchedCount === 0) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
      }

      item.status = "cancelled";

      // Recalculate overall order status using non-cancelled items.
      const activeStatuses = order.items
        .map((orderItem) => orderItem.status)
        .filter((status) => status !== "cancelled");

      if (activeStatuses.length === 0) {
        order.status = "cancelled";
      } else if (activeStatuses.every((status) => status === "delivered")) {
        order.status = "delivered";
      } else if (
        activeStatuses.every((status) =>
          ["shipped", "delivered"].includes(status),
        )
      ) {
        order.status = "shipped";
      } else if (
        activeStatuses.every((status) =>
          ["confirmed", "shipped", "delivered"].includes(status),
        )
      ) {
        order.status = "confirmed";
      } else {
        order.status = "placed";
      }

      await order.save({ session });

      updatedOrder = order;
    });

    return res.status(200).json({
      success: true,
      message: "Order item cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    if (
      error.name === "CastError" ||
      error.name === "BSONError" ||
      error.name === "TypeError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID or item ID",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const store = await Store.findOne({
      sellerId: req.user.userId,
      status: "active",
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Active store not found",
      });
    }

    const orders = await Order.find({
      "items.storeId": store._id,
    }).sort({ createdAt: -1 });

    const sellerOrders = orders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.storeId.toString() === store._id.toString(),
      );

      return {
        _id: order._id,
        buyerId: order.buyerId,
        items: sellerItems,
        sellerTotal: sellerItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
        shippingAddress: order.shippingAddress,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: sellerOrders.length,
      orders: sellerOrders,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller orders",
    });
  }
};
const updateSellerItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["confirmed", "shipped", "delivered"];

    if ( typeof status !== "string" ||
  !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use confirmed, shipped, or delivered.",
      });
    }

    const store = await Store.findOne({
      sellerId: req.user.userId,
      status: "active",
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Active store not found",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or item ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      "items._id": itemId,
      "items.storeId": store._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order item not found in your store",
      });
    }

    const item = order.items.id(itemId);

    if (!item || item.storeId.toString() !== store._id.toString()) {
      return res.status(404).json({
        success: false,
        message: "Order item not found in your store",
      });
    }

    const nextStatus = {
      placed: "confirmed",
      confirmed: "shipped",
      shipped: "delivered",
    };

    if (nextStatus[item.status] !== status) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${item.status} to ${status}`,
      });
    }

    item.status = status;

    const statuses = order.items.map((item) => item.status);

    // Ignore cancelled items when calculating order progress.
    const activeStatuses = statuses.filter((status) => status !== "cancelled");

    if (activeStatuses.length === 0) {
      order.status = "cancelled";
    } else if (activeStatuses.every((status) => status === "delivered")) {
      order.status = "delivered";
    } else if (
      activeStatuses.every(
        (status) => status === "shipped" || status === "delivered",
      )
    ) {
      order.status = "shipped";
    } else if (
      activeStatuses.every((status) =>
        ["confirmed", "shipped", "delivered"].includes(status),
      )
    ) {
      order.status = "confirmed";
    } else {
      order.status = "placed";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order item status updated successfully",
      itemId: item._id,
      itemStatus: item.status,
      orderStatus: order.status,
    });
  } catch (error) {
    console.error("Update seller item status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order item status",
    });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  updateSellerItemStatus,
};
