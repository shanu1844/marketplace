
const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { createProduct, getMyProducts,getPublicProducts,getProductCategories, getProductById,updateProduct,updateProductStatus,deleteProduct,} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { sellerOnly } = require("../middleware/sellerMiddleware");

const router = express.Router();
router.get("/public", getPublicProducts);
router.get("/categories", getProductCategories);
router.get("/my-products", protect, sellerOnly, getMyProducts);
router.get("/:productId", getProductById);
router.post("/", protect, sellerOnly, upload.single("image"), createProduct);



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
