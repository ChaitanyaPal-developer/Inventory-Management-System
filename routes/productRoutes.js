
const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
  getLowStockProducts,
  getCategorySummary
} = require("../controllers/productController");

// Create a product
router.post("/", createProduct);

// Get all products with filtering, sorting and pagination
router.get("/", getProducts);

// Reports (keep these before the /:id route)
router.get("/low-stock", getLowStockProducts);
router.get("/category-summary", getCategorySummary);

// Adjust product stock
router.patch("/:id/stock", adjustStock);

// Get, update and delete a product by ID
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
