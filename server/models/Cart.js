const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

quantity: {
  type: Number,
  required: true,
  min: [1, "Quantity must be at least 1"],
  validate: {
    validator: Number.isInteger,
    message: "Quantity must be a whole number",
  },
  default: 1,
},

      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;