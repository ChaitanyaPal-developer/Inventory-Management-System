
const Product = require("../models/Product");

// 1. CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.code === 11000
        ? "SKU already exists"
        : error.message
    });
  }
};

// 2. GET ALL PRODUCTS (FILTERING, SORTING, PAGINATION)
const getProducts = async (req, res) => {
  try {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }

      if (
        Object.values(filter.price).some(
          value => !Number.isFinite(value) || value < 0
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price filter"
        });
      }

      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        Number(minPrice) > Number(maxPrice)
      ) {
        return res.status(400).json({
          success: false,
          message: "minPrice cannot exceed maxPrice"
        });
      }
    }

    const allowedSortFields = [
      "name",
      "price",
      "quantity",
      "createdAt"
    ];

    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort field"
      });
    }

    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({
        success: false,
        message: "Order must be asc or desc"
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit"
      });
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }
};

// 4. UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "sku",
      "category",
      "description",
      "price",
      "lowStockThreshold"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.code === 11000
        ? "SKU already exists"
        : error.message
    });
  }
};

// 5. ADJUST STOCK
const adjustStock = async (req, res) => {
  try {
    const { adjustment } = req.body;

    if (
      !Number.isInteger(adjustment) ||
      adjustment === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Adjustment must be a non-zero whole number"
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const newQuantity = product.quantity + adjustment;

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock"
      });
    }

    product.quantity = newQuantity;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 6. DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }
};

// 7. LOW-STOCK REPORT
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: {
        $lte: ["$quantity", "$lowStockThreshold"]
      }
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 8. CATEGORY-WISE SUMMARY
const getCategorySummary = async (req, res) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalInventoryValue: {
            $sum: { $multiply: ["$price", "$quantity"] }
          },
          averagePrice: { $avg: "$price" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
  getLowStockProducts,
  getCategorySummary
};
