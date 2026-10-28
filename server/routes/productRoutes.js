
const express = require("express");

const { createProduct, getMyProducts,getPublicProducts, getProductById,updateProduct,updateProductStatus,deleteProduct,} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { sellerOnly } = require("../middleware/sellerMiddleware");

const router = express.Router();
router.get("/public", getPublicProducts);
router.get("/my-products", protect, sellerOnly, getMyProducts);
router.get("/:productId", getProductById);
router.post("/", protect, sellerOnly, createProduct);



router.patch("/:productId", protect, sellerOnly, updateProduct);
router.patch(
  "/:productId/status",
  protect,
  sellerOnly,
  updateProductStatus
);
router.delete(
  "/:productId",
  protect,
  sellerOnly,
  deleteProduct
);

module.exports = router;
