const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        storeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },

price: {
  type: Number,
  required: true,
  min: [0.01, "Price must be greater than zero"],
},


quantity: {
  type: Number,
  required: true,
  min: [1, "Quantity must be at least 1"],
  validate: {
    validator: Number.isInteger,
    message: "Quantity must be a whole number",
  },
},

        status: {
          type: String,
          enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
          default: "placed",
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      addressLine: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
