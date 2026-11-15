const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware to read JSON request bodies
app.use(express.json());

// Middleware to read URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Product routes
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Inventory Management System API is Running!");
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

app.use(notFound);
app.use(errorHandler);

startServer();
