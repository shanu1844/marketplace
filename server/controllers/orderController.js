const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Store = require("../models/Store");
const razorpay = require("../config/razorpay");

// ==========================================
// PLACE ORDER
// ==========================================

const placeOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = "COD" } = req.body;

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

  if (paymentMethod !== "COD") {
    return res.status(400).json({
      success: false,
      message: "Currently only Cash on Delivery is available.",
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
          productImage: product.image || "",
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
            paymentMethod,
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

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

const createRazorpayOrder = async (req, res) => {
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
        !shippingAddress[field].trim()
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Complete shipping address is required",
    });
  }

  let session;

  try {
    // 1. Fetch buyer cart
    const cart = await Cart.findOne({
      userId: req.user.userId,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // Keep a snapshot of cart items
    const cartSnapshot = cart.items.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
    }));

    // 2. Calculate amount using database prices
    let totalAmount = 0;

    for (const item of cart.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart quantity",
        });
      }

      const product = await Product.findOne({
        _id: item.productId,
        status: "active",
        isDeleted: false,
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is unavailable",
        });
      }

      const store = await Store.findOne({
        _id: product.storeId,
        status: "active",
      });

      if (!store) {
        return res.status(400).json({
          success: false,
          message: "A product's store is unavailable",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      totalAmount += product.price * item.quantity;
    }

    // Convert INR to paise
    const amountInPaise = Math.round(totalAmount * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // 3. Create Razorpay payment order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        buyerId: req.user.userId.toString(),
      },
    });

    // 4. Revalidate cart and reserve stock transactionally
    session = await mongoose.startSession();

    let order;

    await session.withTransaction(async () => {
      const currentCart = await Cart.findOne({
        userId: req.user.userId,
      }).session(session);

      if (!currentCart || currentCart.items.length === 0) {
        const error = new Error("Your cart is empty");
        error.statusCode = 400;
        throw error;
      }

      // Ensure cart has not changed since amount calculation
      const currentSnapshot = currentCart.items.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
      }));

      if (
        JSON.stringify(currentSnapshot) !==
        JSON.stringify(cartSnapshot)
      ) {
        const error = new Error(
          "Your cart changed. Please try again."
        );
        error.statusCode = 409;
        throw error;
      }

      const orderItems = [];
      let verifiedTotal = 0;

      for (const item of currentCart.items) {
        const product = await Product.findOne({
          _id: item.productId,
          status: "active",
          isDeleted: false,
        }).session(session);

        if (!product) {
          const error = new Error(
            "A product in your cart is unavailable"
          );
          error.statusCode = 400;
          throw error;
        }

        const store = await Store.findOne({
          _id: product.storeId,
          status: "active",
        }).session(session);

        if (!store) {
          const error = new Error(
            "A product's store is unavailable"
          );
          error.statusCode = 400;
          throw error;
        }

        // Reserve stock
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
          { session }
        );

        if (stockUpdated.modifiedCount !== 1) {
          const error = new Error(
            `Insufficient stock for ${product.name}`
          );
          error.statusCode = 409;
          throw error;
        }

        const itemTotal = product.price * item.quantity;
        verifiedTotal += itemTotal;

        orderItems.push({
          productId: product._id,
          storeId: store._id,
          productName: product.name,
          productImage: product.image || "",
          price: product.price,
          quantity: item.quantity,
          paymentStatus: "pending",
        });
      }

      // Ensure database amount matches Razorpay amount
      if (Math.round(verifiedTotal * 100) !== razorpayOrder.amount) {
        const error = new Error(
          "Product prices changed. Please try again."
        );
        error.statusCode = 409;
        throw error;
      }

      // Create pending payment order
      const [createdOrder] = await Order.create(
        [
          {
            buyerId: req.user.userId,
            items: orderItems,
            totalAmount: verifiedTotal,

            shippingAddress: {
              fullName: shippingAddress.fullName.trim(),
              phone: shippingAddress.phone.trim(),
              addressLine: shippingAddress.addressLine.trim(),
              city: shippingAddress.city.trim(),
              state: shippingAddress.state.trim(),
              pincode: shippingAddress.pincode.trim(),
            },

            status: "pending_payment",
            paymentMethod: "RAZORPAY",
            paymentStatus: "pending",

            razorpayOrderId: razorpayOrder.id,
            paymentInitiatedAt: new Date(),
          },
        ],
        { session }
      );

      order = createdOrder;
    });

    // 5. Return payment details to frontend
    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",

      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to create payment order",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


// ==========================================
// CANCEL / ABANDON RAZORPAY ORDER
// ==========================================


const cancelRazorpayOrder = async (req, res) => {
  let session;

  try {
    const { orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      buyerId: req.user.userId,
      paymentMethod: "RAZORPAY",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "Payment is already completed. Stock cannot be restored.",
      });
    }

    if (order.stockReleasedAt) {
      return res.status(200).json({
        success: true,
        message: "Stock was already restored",
      });
    }

    if (
      order.status !== "pending_payment" ||
      order.paymentStatus !== "pending"
    ) {
      return res.status(409).json({
        success: false,
        message: "Order is not eligible for cancellation",
      });
    }

    // Check Razorpay before releasing reserved stock.
    const payments = await razorpay.orders.fetchPayments(
      order.razorpayOrderId
    );

    const paymentAttempts = payments.items || [];

    const capturedPayment = paymentAttempts.find(
      (payment) => payment.status === "captured"
    );

    if (capturedPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment is captured. Please verify your order.",
      });
    }

    // Keep stock reserved if any payment attempt is unresolved.
    const unresolvedPayment = paymentAttempts.find(
      (payment) =>
        !["failed", "refunded"].includes(payment.status)
    );

    if (unresolvedPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment is still processing. Please try again later.",
      });
    }

    session = await mongoose.startSession();

    let cancelledOrder;

    await session.withTransaction(async () => {
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          buyerId: req.user.userId,
          paymentMethod: "RAZORPAY",
          paymentStatus: "pending",
          status: "pending_payment",
          stockReleasedAt: null,
        },
        {
          $set: {
            status: "cancelled",
            paymentStatus: "failed",
            stockReleasedAt: new Date(),
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedOrder) {
        throw new Error("ORDER_ALREADY_PROCESSED");
      }

      for (const item of updatedOrder.items) {
        const stockResult = await Product.updateOne(
          {
            _id: item.productId,
          },
          {
            $inc: {
              stock: item.quantity,
            },
          },
          { session }
        );

        if (stockResult.matchedCount !== 1) {
          throw new Error("PRODUCT_NOT_FOUND");
        }
      }

      cancelledOrder = updatedOrder;
    });

    return res.status(200).json({
      success: true,
      message: "Payment cancelled and stock restored successfully",
      order: cancelledOrder,
    });

  } catch (error) {
    console.error("Cancel Razorpay order error:", error);

    if (error.message === "ORDER_ALREADY_PROCESSED") {
      return res.status(409).json({
        success: false,
        message: "Order was already processed. Please refresh.",
      });
    }

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(409).json({
        success: false,
        message: "A product could not be found. Stock restoration requires review.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to cancel payment order",
    });

  } finally {
    if (session) {
      await session.endSession();
    }
  }
};



const verifyRazorpayPayment = async (req, res) => {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "All payment details are required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      buyerId: req.user.userId,
      razorpayOrderId: razorpay_order_id,
      paymentMethod: "RAZORPAY",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent duplicate payment verification
    if (order.paymentStatus === "paid") {
  if (order.razorpayPaymentId === razorpay_payment_id) {
    return res.status(200).json({
      success: true,
      message: "Payment already verified",
    });
  }

  return res.status(409).json({
    success: false,
    message: "A different payment is already associated with this order.",
  });
}

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(generatedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    const isValidSignature =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
// Fetch payment details directly from Razorpay
const payment = await razorpay.payments.fetch(razorpay_payment_id);

// Verify payment status
if (payment.status !== "captured") {
  return res.status(400).json({
    success: false,
    message: "Payment is not captured yet",
  });
}

// Verify Razorpay order ID
if (payment.order_id !== razorpay_order_id) {
  return res.status(400).json({
    success: false,
    message: "Payment order ID mismatch",
  });
}

// Verify payment amount
const expectedAmount = Math.round(order.totalAmount * 100);

if (payment.amount !== expectedAmount) {
  return res.status(400).json({
    success: false,
    message: "Payment amount mismatch",
  });
}

// Verify currency
if (payment.currency !== "INR") {
  return res.status(400).json({
    success: false,
    message: "Invalid payment currency",
  });
}
// Atomically mark the order as paid
const updatedOrder = await Order.findOneAndUpdate(
  {
    _id: order._id,
    buyerId: req.user.userId,
    razorpayOrderId: razorpay_order_id,
    paymentMethod: "RAZORPAY",
    paymentStatus: "pending",
    status: "pending_payment",
    stockReleasedAt: null,
  },
  {
    $set: {
      status: "placed",
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      "items.$[].paymentStatus": "paid",
    },
  },
  { new: true }
);

// Webhook may have processed the same payment first
if (!updatedOrder) {
  const latestOrder = await Order.findById(order._id);

  if (
    latestOrder &&
    latestOrder.paymentStatus === "paid" &&
    latestOrder.razorpayPaymentId === razorpay_payment_id
  ) {
    // Same payment was already processed by webhook
    await Cart.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { items: [] } }
    );

    return res.status(200).json({
      success: true,
      message: "Payment already verified successfully",
    });
  }

  return res.status(409).json({
    success: false,
    message:
      "Payment captured, but the order is no longer active. Please contact support.",
  });
}

// Clear cart only after successful payment verification
await Cart.findOneAndUpdate(
  { userId: req.user.userId },
  { $set: { items: [] } }
);

return res.status(200).json({
  success: true,
  message: "Payment verified successfully",
});

  } catch (error) {
    console.error("Razorpay verification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};


const reconcileRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      typeof razorpayPaymentId !== "string" ||
      !razorpayPaymentId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID and Razorpay payment ID are required",
      });
    }

    // 1. Find the MongoDB order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 2. Handle duplicate reconciliation safely
    if (order.paymentStatus === "paid") {
      if (order.razorpayPaymentId === razorpayPaymentId) {
        return res.status(200).json({
          success: true,
          message: "Payment is already reconciled",
        });
      }

      return res.status(409).json({
        success: false,
        message: "A different payment is already associated with this order",
      });
    }

    // 3. Only reconcile an active pending Razorpay order
    if (
      order.paymentMethod !== "RAZORPAY" ||
      order.paymentStatus !== "pending" ||
      order.status !== "pending_payment" ||
      order.stockReleasedAt !== null ||
      !order.razorpayOrderId
    ) {
      return res.status(409).json({
        success: false,
        message: "Order is not eligible for payment reconciliation",
      });
    }

    // 4. Fetch payment directly from Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (
      payment.status !== "captured" ||
      payment.captured !== true
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment is not captured",
      });
    }

    // 5. Verify Razorpay order ID
    if (payment.order_id !== order.razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID mismatch",
      });
    }

    // 6. Verify amount and currency
    const expectedAmount = Math.round(order.totalAmount * 100);

    if (
      payment.amount !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount or currency mismatch",
      });
    }

    // 7. Atomically update the pending order
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        razorpayOrderId: payment.order_id,
        paymentMethod: "RAZORPAY",
        paymentStatus: "pending",
        status: "pending_payment",
        stockReleasedAt: null,
      },
      {
        $set: {
          status: "placed",
          paymentStatus: "paid",
          razorpayPaymentId: payment.id,
          "items.$[].paymentStatus": "paid",
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(409).json({
        success: false,
        message: "Order changed during reconciliation. Please check its latest status.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment reconciled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Razorpay reconciliation error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment reconciliation failed",
    });
  }
};


// ==========================================
// GET BUYER ORDERS
// ==========================================

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

// ==========================================
// GET SINGLE ORDER DETAILS
// ==========================================

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

// ==========================================
// CANCEL BUYER ORDER ITEM
// ==========================================

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
// Prevent cancellation before Razorpay payment is verified
if (
  order.paymentMethod === "RAZORPAY" &&
  order.paymentStatus !== "paid"
) {
  const error = new Error(
    "Razorpay payment is not completed. Order cannot be cancelled yet."
  );
  error.statusCode = 409;
  throw error;
}


      const item = order.items.id(itemId);

      if (!item) {
        const error = new Error("Order item not found");
        error.statusCode = 404;
        throw error;
      }

      if (item.status !== "placed") {
        const error = new Error("Only placed items can be cancelled");
        error.statusCode = 400;
        throw error;
      }

      const stockResult = await Product.updateOne(
        {
          _id: item.productId,
          isDeleted: false,
        },
        {
          $inc: { stock: item.quantity },
        },
        { session },
      );

      if (stockResult.matchedCount === 0) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
      }

      item.status = "cancelled";

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

// ==========================================
// GET SELLER ORDERS
// ==========================================

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
        paymentMethod: order.paymentMethod,
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

// ==========================================
// UPDATE SELLER ITEM STATUS
// ==========================================

const updateSellerItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["confirmed", "shipped", "delivered"];

    if (typeof status !== "string" || !allowedStatuses.includes(status)) {
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

    // Save delivery timestamp when item is delivered.
    if (status === "delivered" && !item.deliveredAt) {
      item.deliveredAt = new Date();
    }

    const statuses = order.items.map((orderItem) => orderItem.status);

    const activeStatuses = statuses.filter(
      (itemStatus) => itemStatus !== "cancelled",
    );

    if (activeStatuses.length === 0) {
      order.status = "cancelled";
    } else if (
      activeStatuses.every((itemStatus) => itemStatus === "delivered")
    ) {
      order.status = "delivered";
    } else if (
      activeStatuses.every(
        (itemStatus) => itemStatus === "shipped" || itemStatus === "delivered",
      )
    ) {
      order.status = "shipped";
    } else if (
      activeStatuses.every((itemStatus) =>
        ["confirmed", "shipped", "delivered"].includes(itemStatus),
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
      deliveredAt: item.deliveredAt,
    });
  } catch (error) {
    console.error("Update seller item status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order item status",
    });
  }
};

// ==========================================
// COLLECT SELLER COD PAYMENT
// ==========================================

const collectSellerItemPayment = async (req, res) => {
  let session;

  try {
    const { orderId, itemId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or item ID.",
      });
    }

    session = await mongoose.startSession();

    let result;

    await session.withTransaction(async () => {
      const store = await Store.findOne({
        sellerId: req.user.userId,
        status: "active",
      }).session(session);

      if (!store) {
        throw new Error("ACTIVE_STORE_NOT_FOUND");
      }

      const order = await Order.findOne({
        _id: orderId,
        "items._id": itemId,
        "items.storeId": store._id,
      }).session(session);

      if (!order) {
        throw new Error("ORDER_OR_ITEM_NOT_FOUND");
      }

      if (order.paymentMethod !== "COD") {
        throw new Error("ONLY_COD_SUPPORTED");
      }

      const item = order.items.id(itemId);

      if (!item) {
        throw new Error("ITEM_NOT_FOUND");
      }

      if (item.status !== "delivered") {
        throw new Error("ITEM_NOT_DELIVERED");
      }

      if (item.paymentStatus === "paid") {
        throw new Error("PAYMENT_ALREADY_COLLECTED");
      }

      item.paymentStatus = "paid";

      const activeItems = order.items.filter(
        (orderItem) => orderItem.status !== "cancelled",
      );

      order.paymentStatus =
        activeItems.length > 0 &&
        activeItems.every((orderItem) => orderItem.paymentStatus === "paid")
          ? "paid"
          : "pending";

      await order.save({ session });

      result = {
        itemPaymentStatus: item.paymentStatus,
        orderPaymentStatus: order.paymentStatus,
      };
    });

    return res.status(200).json({
      success: true,
      message: "COD payment marked as collected successfully.",
      ...result,
    });
  } catch (error) {
    const errors = {
      ACTIVE_STORE_NOT_FOUND: [404, "Active store not found."],
      ORDER_OR_ITEM_NOT_FOUND: [404, "Order or seller item not found."],
      ONLY_COD_SUPPORTED: [
        400,
        "Payment collection is only available for COD orders.",
      ],
      ITEM_NOT_FOUND: [404, "Order item not found."],
      ITEM_NOT_DELIVERED: [
        400,
        "Payment can only be collected after item delivery.",
      ],
      PAYMENT_ALREADY_COLLECTED: [400, "Payment has already been collected."],
    };

    const knownError = errors[error.message];

    if (knownError) {
      return res.status(knownError[0]).json({
        success: false,
        message: knownError[1],
      });
    }

    console.error("COD payment collection error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to collect COD payment.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// ==========================================
// BUYER REQUEST ITEM RETURN
// ==========================================

const requestItemReturn = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason, description = "" } = req.body;

    const allowedReasons = [
      "damaged",
      "wrong_product",
      "quality_issue",
      "size_issue",
      "missing_parts",
      "other",
    ];

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or item ID.",
      });
    }

    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid return reason.",
      });
    }

    if (typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid return description.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      buyerId: req.user.userId,
      "items._id": itemId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order or item not found.",
      });
    }

    const item = order.items.id(itemId);

    if (item.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered items can be returned.",
      });
    }

    if (!item.deliveredAt) {
      return res.status(400).json({
        success: false,
        message: "Delivery date is not available for this item.",
      });
    }

    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    const returnDeadline = new Date(item.deliveredAt).getTime() + sevenDays;

    if (Date.now() > returnDeadline) {
      return res.status(400).json({
        success: false,
        message: "Return window of 7 days has expired.",
      });
    }

    if (item.returnStatus !== "not_requested") {
      return res.status(400).json({
        success: false,
        message: "Return request already exists for this item.",
      });
    }

    item.returnStatus = "requested";
    item.returnReason = reason;
    item.returnDescription = description.trim();
    item.returnRequestedAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Return request submitted successfully.",
      itemId: item._id,
      returnStatus: item.returnStatus,
    });
  } catch (error) {
    console.error("Return request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit return request.",
    });
  }
};

// ==========================================
// SELLER APPROVE / REJECT RETURN REQUEST
// ==========================================

const reviewSellerReturnRequest = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or item ID.",
      });
    }

    const store = await Store.findOne({
      sellerId: req.user.userId,
      status: "active",
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Active store not found.",
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
        message: "Order item not found in your store.",
      });
    }

    const item = order.items.id(itemId);

    if (!item || item.returnStatus !== "requested") {
      return res.status(400).json({
        success: false,
        message: "No pending return request found for this item.",
      });
    }

    item.returnStatus = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Return request ${status} successfully.`,
      itemId: item._id,
      returnStatus: item.returnStatus,
    });
  } catch (error) {
    console.error("Seller return review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review return request.",
    });
  }
};



const processAutomaticRazorpayRefund = async (orderId, itemId) => {
  // Fetch the latest order after return transaction is committed
  const order = await Order.findOne({
    _id: orderId,
    paymentMethod: "RAZORPAY",
    paymentStatus: "paid",
    items: {
      $elemMatch: {
        _id: itemId,
        paymentStatus: "paid",
        returnStatus: "completed",
        returnReceivedAt: { $ne: null },
        refundStatus: "pending",
        refundAmount: { $gte: 1 },
        $or: [
          { razorpayRefundId: "" },
          { razorpayRefundId: null },
          { razorpayRefundId: { $exists: false } },
        ],
      },
    },
  });

  if (!order) {
    throw new Error(
      "Eligible Razorpay refund was not found or is already processing."
    );
  }

  if (!order.razorpayPaymentId) {
    throw new Error("Razorpay payment ID is missing.");
  }

  const item = order.items.id(itemId);

  if (!item) {
    throw new Error("Order item not found.");
  }

  const amountInPaise = Math.round(Number(item.refundAmount) * 100);

  if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
    throw new Error("Invalid Razorpay refund amount.");
  }

  // Atomically lock pending -> processing
  const lockResult = await Order.updateOne(
    {
      _id: orderId,
      paymentMethod: "RAZORPAY",
      paymentStatus: "paid",
      razorpayPaymentId: order.razorpayPaymentId,
      items: {
        $elemMatch: {
          _id: itemId,
          paymentStatus: "paid",
          returnStatus: "completed",
          returnReceivedAt: { $ne: null },
          refundStatus: "pending",
          refundAmount: item.refundAmount,
          $or: [
            { razorpayRefundId: "" },
            { razorpayRefundId: null },
            { razorpayRefundId: { $exists: false } },
          ],
        },
      },
    },
    {
      $set: {
        "items.$.refundStatus": "processing",
        "items.$.refundMethod": "RAZORPAY",
      },
    }
  );

  if (lockResult.modifiedCount !== 1) {
    throw new Error("Refund is already being processed.");
  }

  const credentials = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");

  const idempotencyKey = `refund_${orderId}_${itemId}`;

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${order.razorpayPaymentId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "X-Refund-Idempotency": idempotencyKey,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        notes: {
          orderId: orderId.toString(),
          itemId: itemId.toString(),
        },
      }),
    }
  );

  const refundData = await response.json();

  if (!response.ok || !refundData.id || !refundData.status) {
    // Keep processing if API outcome is uncertain.
    // Reconcile with Razorpay before retrying.
    console.error("Automatic Razorpay refund response:", refundData);
    throw new Error("Razorpay refund could not be confirmed.");
  }

  // Fetch latest order to avoid overwriting webhook updates
  const latestOrder = await Order.findById(orderId);

  if (!latestOrder) {
    throw new Error("Refund created but order was not found.");
  }

  const latestItem = latestOrder.items.id(itemId);

  if (!latestItem) {
    throw new Error("Refund created but item was not found.");
  }

  if (
    latestItem.razorpayRefundId &&
    latestItem.razorpayRefundId !== refundData.id
  ) {
    throw new Error("Refund ID mismatch. Manual reconciliation required.");
  }

  latestItem.razorpayRefundId = refundData.id;

  if (latestItem.refundStatus !== "refunded") {
    if (refundData.status === "processed") {
      latestItem.refundStatus = "refunded";
      latestItem.refundedAt = new Date();
    } else if (refundData.status === "failed") {
      latestItem.refundStatus = "failed";
    } else {
      latestItem.refundStatus = "processing";
    }
  }

  await latestOrder.save();

  return {
    refundId: refundData.id,
    refundStatus: latestItem.refundStatus,
  };
};


const markReturnReceived = async (req, res) => {
  let session;

  try {
    const { orderId, itemId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or item ID.",
      });
    }

    session = await mongoose.startSession();

    let result;

    await session.withTransaction(async () => {
      // Find seller's active store
      const store = await Store.findOne({
        sellerId: req.user.userId,
        status: "active",
      }).session(session);

      if (!store) {
        const error = new Error("Active store not found.");
        error.statusCode = 404;
        throw error;
      }

      // Match item and store together
      const order = await Order.findOne({
        _id: orderId,
        items: {
          $elemMatch: {
            _id: itemId,
            storeId: store._id,
          },
        },
      }).session(session);

      if (!order) {
        const error = new Error(
          "Order item not found in your store."
        );
        error.statusCode = 404;
        throw error;
      }

      const item = order.items.id(itemId);

      if (!item || item.returnStatus !== "approved") {
        const error = new Error(
          "Only approved return requests can be marked as received."
        );
        error.statusCode = 400;
        throw error;
      }

      // Prevent duplicate stock restoration
      if (item.stockRestoredAt || item.returnReceivedAt) {
        const error = new Error(
          "Returned product has already been received."
        );
        error.statusCode = 409;
        throw error;
      }

      // Restore product stock inside the same transaction
      const stockResult = await Product.updateOne(
        {
          _id: item.productId,
        },
        {
          $inc: {
            stock: item.quantity,
          },
        },
        { session }
      );

      if (stockResult.matchedCount !== 1) {
        const error = new Error(
          "Product not found. Stock could not be restored."
        );
        error.statusCode = 404;
        throw error;
      }

      const receivedAt = new Date();

      item.stockRestoredAt = receivedAt;
      item.returnReceivedAt = receivedAt;
      item.returnStatus = "completed";

      if (item.paymentStatus === "paid") {
        item.refundStatus = "pending";
        item.refundAmount = item.price * item.quantity;
      } else {
        item.refundStatus = "not_applicable";
        item.refundAmount = 0;
      }

      await order.save({ session });

      result = {
        itemId: item._id,
        returnStatus: item.returnStatus,
        returnReceivedAt: item.returnReceivedAt,
        stockRestoredAt: item.stockRestoredAt,
        refundStatus: item.refundStatus,
        refundAmount: item.refundAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      };
    });

    // Transaction committed. End session before calling Razorpay.
    await session.endSession();
    session = null;

    // Automatically initiate Razorpay refund
    if (
      result.paymentMethod === "RAZORPAY" &&
      result.paymentStatus === "paid" &&
      result.refundStatus === "pending"
    ) {
      try {
        const refundResult =
          await processAutomaticRazorpayRefund(orderId, itemId);

        result.refundStatus = refundResult.refundStatus;
        result.razorpayRefundId = refundResult.refundId || null;

      } catch (refundError) {
        console.error(
          "Automatic Razorpay refund initiation failed:",
          refundError.message
        );

        // Return/stock restoration remains successful.
        result.refundStatus = "processing";
        result.refundMessage =
          "Return received successfully. Refund initiation needs reconciliation.";
      }
    }

    return res.status(200).json({
      success: true,
      message: "Returned product received and stock restored successfully.",
      ...result,
    });

  } catch (error) {
    console.error("Mark return received error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to confirm returned product.",
    });

  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


// ==========================================
// GET SELLER RETURN REQUESTS
// ==========================================

const getSellerReturnRequests = async (req, res) => {
  try {
    const store = await Store.findOne({
      sellerId: req.user.userId,
      status: "active",
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Active store not found.",
      });
    }

    const orders = await Order.find({
      "items.storeId": store._id,
      "items.returnStatus": {
        $in: ["requested", "approved", "rejected", "completed"],
      },
    })
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 });

    const returnRequests = orders.flatMap((order) => {
      return order.items
        .filter(
          (item) =>
            item.storeId.toString() === store._id.toString() &&
            item.returnStatus !== "not_requested",
        )
        .map((item) => ({
          orderId: order._id,
          itemId: item._id,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.price,
          returnReason: item.returnReason,
          returnDescription: item.returnDescription,
          returnStatus: item.returnStatus,
          returnRequestedAt: item.returnRequestedAt,
          deliveredAt: item.deliveredAt,
          returnReceivedAt: item.returnReceivedAt,
          refundStatus: item.refundStatus,
          refundAmount: item.refundAmount,

          refundMethod: item.refundMethod,
refundDetails: item.refundDetails,
refundDetailsSubmittedAt: item.refundDetailsSubmittedAt,
          buyer: order.buyerId,
        }));
    });

    return res.status(200).json({
      success: true,
      count: returnRequests.length,
      returnRequests,
    });
  } catch (error) {
    console.error("Get seller return requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch return requests.",
    });
  }
};

const markRefundCompleted = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { refundReference = "" } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or item ID.",
      });
    }

    const store = await Store.findOne({
      sellerId: req.user.userId,
      status: "active",
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Active store not found.",
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
        message: "Order item not found in your store.",
      });
    }

    const item = order.items.id(itemId);

    if (!item || item.returnStatus !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Returned product must be received first.",
      });
    }

    if (item.refundStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "No pending refund found for this item.",
      });
    }

    if (item.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Refund is not applicable for unpaid items.",
      });
    }
    // Manual bank transfer is only allowed for COD orders
if (order.paymentMethod !== "COD") {
  return res.status(400).json({
    success: false,
    message: "Razorpay refunds must be processed through Razorpay.",
  });
}

// Buyer must submit bank details first
if (
  item.refundMethod !== "BANK" ||
  !item.refundDetailsSubmittedAt
) {
  return res.status(400).json({
    success: false,
    message: "Buyer bank details are required before completing the refund.",
  });
}

// Validate refund reference
if (
  typeof refundReference !== "string" ||
  !refundReference.trim()
) {
  return res.status(400).json({
    success: false,
    message: "Refund transaction reference is required.",
  });
}

    item.refundStatus = "refunded";
    item.refundedAt = new Date();
    item.refundReference = refundReference.trim();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Refund marked as completed successfully.",
      itemId: item._id,
      refundStatus: item.refundStatus,
      refundedAt: item.refundedAt,
      refundReference: item.refundReference,
    });
  } catch (error) {
    console.error("Mark refund completed error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete refund.",
    });
  }
};





const initiateRazorpayRefund = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or item ID.",
      });
    }

    // Find seller's active store
    const store = await Store.findOne({
      sellerId: req.user.userId,
      status: "active",
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Active store not found.",
      });
    }

    // Find seller's order and item
    const order = await Order.findOne({
      _id: orderId,
      items: {
        $elemMatch: {
          _id: itemId,
          storeId: store._id,
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order item not found in your store.",
      });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Order item not found.",
      });
    }

    // Razorpay orders only
    if (order.paymentMethod !== "RAZORPAY") {
      return res.status(400).json({
        success: false,
        message: "This is not a Razorpay order.",
      });
    }

    // Returned product must be received
    if (
      item.returnStatus !== "completed" ||
      !item.returnReceivedAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Returned product must be received first.",
      });
    }

    // Payment must be captured
    if (
      order.paymentStatus !== "paid" ||
      item.paymentStatus !== "paid" ||
      !order.razorpayPaymentId
    ) {
      return res.status(400).json({
        success: false,
        message: "Captured Razorpay payment not found.",
      });
    }

    // Refund must be pending
    if (
      item.refundStatus !== "pending" ||
      item.razorpayRefundId
    ) {
      return res.status(409).json({
        success: false,
        message: "Item does not have an eligible pending refund.",
      });
    }

    // Use the approved refund amount saved in the order item
    const refundAmount = Math.round(
      Number(item.refundAmount) * 100
    );

    if (
      !Number.isSafeInteger(refundAmount) ||
      refundAmount < 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund amount. Minimum refund is ₹1.",
      });
    }

    // Atomically lock the refund.
    // Only one concurrent request can change pending -> processing.
    const lockResult = await Order.updateOne(
      {
        _id: orderId,
        paymentMethod: "RAZORPAY",
        paymentStatus: "paid",
        razorpayPaymentId: order.razorpayPaymentId,
        items: {
          $elemMatch: {
            _id: itemId,
            storeId: store._id,
            paymentStatus: "paid",
            returnStatus: "completed",
            returnReceivedAt: { $ne: null },
            refundStatus: "pending",
            refundAmount: item.refundAmount,
            $or: [
              { razorpayRefundId: "" },
              { razorpayRefundId: null },
              { razorpayRefundId: { $exists: false } },
            ],
          },
        },
      },
      {
        $set: {
          "items.$.refundStatus": "processing",
          "items.$.refundMethod": "RAZORPAY",
        },
      }
    );

    if (lockResult.modifiedCount !== 1) {
      return res.status(409).json({
        success: false,
        message:
          "Refund is already being processed or is no longer eligible.",
      });
    }

    // Stable idempotency key
    const idempotencyKey = `refund_${orderId}_${itemId}`;

    // Razorpay credentials
    const credentials = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    // Create Razorpay refund
    const razorpayResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${order.razorpayPaymentId}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          "X-Refund-Idempotency": idempotencyKey,
        },
        body: JSON.stringify({
          amount: refundAmount,
          notes: {
            orderId: orderId.toString(),
            itemId: itemId.toString(),
          },
        }),
      }
    );

    const refundData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay refund API error:", refundData);

      // Keep processing because API outcome may be uncertain.
      // Reconcile before attempting another request.
      return res.status(502).json({
        success: false,
        message:
          "Refund request could not be confirmed. Check Razorpay dashboard before retrying.",
      });
    }

    if (!refundData.id || !refundData.status) {
      console.error(
        "Invalid Razorpay refund response:",
        refundData
      );

      return res.status(502).json({
        success: false,
        message: "Invalid refund response from Razorpay.",
      });
    }

    // Fetch latest order because webhook may have
    // updated refund status already.
    const latestOrder = await Order.findOne({
      _id: orderId,
      paymentMethod: "RAZORPAY",
      razorpayPaymentId: order.razorpayPaymentId,
      items: {
        $elemMatch: {
          _id: itemId,
          storeId: store._id,
        },
      },
    });

    if (!latestOrder) {
      return res.status(500).json({
        success: false,
        message: "Refund created but order could not be updated.",
        refundId: refundData.id,
      });
    }

    const latestItem = latestOrder.items.id(itemId);

    if (!latestItem) {
      return res.status(500).json({
        success: false,
        message: "Refund created but item could not be updated.",
        refundId: refundData.id,
      });
    }

    // Prevent a different refund ID from overwriting
    if (
      latestItem.razorpayRefundId &&
      latestItem.razorpayRefundId !== refundData.id
    ) {
      console.error("Refund ID mismatch:", {
        existing: latestItem.razorpayRefundId,
        received: refundData.id,
      });

      return res.status(409).json({
        success: false,
        message: "Refund ID mismatch. Manual review required.",
      });
    }

    // Save Razorpay refund ID
    latestItem.razorpayRefundId = refundData.id;

    // Map Razorpay status to Order schema enum.
    // Preserve a completed webhook update.
    if (latestItem.refundStatus !== "refunded") {
      if (refundData.status === "processed") {
        latestItem.refundStatus = "refunded";
        latestItem.refundedAt = new Date();
      } else if (refundData.status === "pending") {
        latestItem.refundStatus = "processing";
      } else if (refundData.status === "failed") {
        latestItem.refundStatus = "failed";
      } else {
        latestItem.refundStatus = "processing";
      }
    }

    await latestOrder.save();

    return res.status(200).json({
      success: true,
      message: "Razorpay refund initiated successfully.",
      refundId: refundData.id,
      razorpayStatus: refundData.status,
      refundStatus: latestItem.refundStatus,
      refundAmount: latestItem.refundAmount,
    });
  } catch (error) {
    console.error("Initiate Razorpay refund error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to confirm refund status. Check Razorpay dashboard.",
    });
  }
};




const submitRefundDetails = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order or item ID.",
      });
    }

    // Validate bank details
    if (
      !accountHolderName?.trim() ||
      !accountNumber?.trim() ||
      !ifscCode?.trim() ||
      !bankName?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All bank details are required.",
      });
    }

    const cleanAccountNumber = accountNumber.trim();
    const cleanIfsc = ifscCode.trim().toUpperCase();

    if (!/^[0-9]{9,18}$/.test(cleanAccountNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid account number.",
      });
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid IFSC code.",
      });
    }

    // Find buyer's order
    const order = await Order.findOne({
      _id: orderId,
      buyerId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Find item
    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Order item not found.",
      });
    }

  // Returned product must be received first
if (item.returnStatus !== "completed" || !item.returnReceivedAt) {
  return res.status(400).json({
    success: false,
    message: "Returned product must be received first.",
  });
}

// Bank transfer is only for COD orders
if (order.paymentMethod !== "COD") {
  return res.status(400).json({
    success: false,
    message: "Bank details are only required for COD refunds.",
  });
}

// Payment must have been collected
if (item.paymentStatus !== "paid") {
  return res.status(400).json({
    success: false,
    message: "Refund is not applicable for an unpaid item.",
  });
}

// A refund must be pending
if (item.refundStatus !== "pending") {
  return res.status(400).json({
    success: false,
    message: "No pending refund found for this item.",
  });
}

    // Refund must not already be completed
    if (item.refundStatus === "refunded") {
      return res.status(400).json({
        success: false,
        message: "Refund has already been completed.",
      });
    }

    if (item.refundStatus === "failed") {
      return res.status(400).json({
        success: false,
        message: "Please contact support before submitting new details.",
      });
    }

    // Save bank details
    item.refundMethod = "BANK";

    item.refundDetails = {
      accountHolderName: accountHolderName.trim(),
      accountNumber: cleanAccountNumber,
      ifscCode: cleanIfsc,
      bankName: bankName.trim(),
    };

    item.refundDetailsSubmittedAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Bank details submitted successfully.",
    });
  } catch (error) {
    console.error("Submit refund details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit bank details.",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  placeOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  updateSellerItemStatus,
  collectSellerItemPayment,
  requestItemReturn,
  reviewSellerReturnRequest,
  getSellerReturnRequests,
  markReturnReceived,
  markRefundCompleted,
  submitRefundDetails,
  reconcileRazorpayPayment,
  initiateRazorpayRefund,
cancelRazorpayOrder,
};
