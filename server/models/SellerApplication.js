const mongoose = require("mongoose");
const sellApplicationSchema = new mongoose.Schema(
     {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      minlength: [2, "Store name must contain at least 2 characters"],
      maxlength: [80, "Store name cannot exceed 80 characters"],
    },

    description: {
      type: String,
      required: [true, "Store description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    phone: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const SellerApplication = mongoose.model(
  "SellerApplication",
  sellApplicationSchema
);

module.exports = SellerApplication;