
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"]
    },

    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      trim: true,
      uppercase: true
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },

    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [0, "Quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number"
      }
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, "Low-stock threshold cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Low-stock threshold must be a whole number"
      }
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
