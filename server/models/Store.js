
const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
