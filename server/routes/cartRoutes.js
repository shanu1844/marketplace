const express = require("express");

const { addToCart,getMyCart, updateCartQuantity,removeFromCart,clearCart, } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addToCart);
router.get("/", protect, getMyCart);
router.patch("/quantity", protect, updateCartQuantity);
router.delete("/", protect, clearCart);
router.delete("/:productId", protect, removeFromCart);
module.exports = router;
