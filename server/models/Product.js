
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must contain at least 2 characters"],
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.01, "Price must be greater than zero"],
    },


stock: {
  type: Number,
  required: [true, "Stock quantity is required"],
  min: [0, "Stock cannot be negative"],
  validate: {
    validator: Number.isInteger,
    message: "Stock must be a whole number",
  },
  default: 0,
},


    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
       lowercase: true,
      maxlength: [60, "Category cannot exceed 60 characters"],
    },


image: {
  type: String,
  default: "",
},

imagePublicId: {
  type: String,
  default: "",
},


    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    isDeleted: {
  type: Boolean,
  default: false,
},
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
