
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

        productImage: {
          type: String,
          default: "",
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
          enum: [
            "placed",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
          ],
          default: "placed",
        },

        // Individual item payment tracking
        paymentStatus: {
          type: String,
          enum: ["pending", "paid", "failed"],
          default: "pending",
        },

        // Individual item return tracking
        returnStatus: {
          type: String,
          enum: [
            "not_requested",
            "requested",
            "approved",
            "rejected",
            "completed",
          ],
          default: "not_requested",
        },

        returnReason: {
          type: String,
          enum: [
            "damaged",
            "wrong_product",
            "quality_issue",
            "size_issue",
            "missing_parts",
            "other",
            "",
          ],
          default: "",
        },

        returnDescription: {
          type: String,
          default: "",
        },

        returnRequestedAt: {
          type: Date,
          default: null,
        },

        deliveredAt: {
          type: Date,
          default: null,
        },

        returnReceivedAt: {
          type: Date,
          default: null,
        },
        // Prevent duplicate stock restoration
stockRestoredAt: {
  type: Date,
  default: null,
},

        // Individual item refund tracking
        refundStatus: {
          type: String,
          enum: [
            "not_applicable",
            "pending",
            "processing",
            "refunded",
            "failed",
          ],
          default: "not_applicable",
        },

        refundAmount: {
          type: Number,
          default: 0,
          min: [0, "Refund amount cannot be negative"],
        },

        refundedAt: {
          type: Date,
          default: null,
        },

        refundReference: {
          type: String,
          default: "",
        },

        refundMethod: {
          type: String,
          enum: ["BANK", "", "RAZORPAY"],
          default: "",
        },

        // COD bank refund details
        refundDetails: {
          accountHolderName: {
            type: String,
            trim: true,
            default: "",
          },

          accountNumber: {
            type: String,
            trim: true,
            default: "",
          },

          ifscCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
          },

          bankName: {
            type: String,
            trim: true,
            default: "",
          },
        },

        refundDetailsSubmittedAt: {
          type: Date,
          default: null,
        },

        // Individual Razorpay refund ID
        razorpayRefundId: {
          type: String,
          default: "",
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
      enum: [
        "pending_payment",
        "placed",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    // Overall order payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "RAZORPAY"],
      default: "COD",
    },

    // Razorpay payment tracking
    razorpayOrderId: {
      type: String,
      default: "",
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    paymentInitiatedAt: {
      type: Date,
      default: null,
    },

    stockReleasedAt: {
      type: Date,
      default: null,
    },

    // Razorpay payment reconciliation tracking
    paymentReconciliationStatus: {
      type: String,
      enum: [
        "not_required",
        "review_required",
        "refund_pending",
        "refunded",
        "resolved",
      ],
      default: "not_required",
    },

    razorpayCapturedAt: {
      type: Date,
      default: null,
    },

    razorpayCapturedAmount: {
      type: Number,
      default: 0,
    },

    // Order-level Razorpay refund tracking
    razorpayRefundId: {
      type: String,
      default: "",
    },

    razorpayRefundStatus: {
      type: String,
      enum: [
        "not_initiated",
        "pending",
        "processed",
        "failed",
      ],
      default: "not_initiated",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
