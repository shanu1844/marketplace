const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { sellerOnly } = require("../middleware/sellerMiddleware");
const { placeOrder, getMyOrders,getOrderById,cancelOrder,getSellerOrders,updateSellerItemStatus, } = require("../controllers/orderController");

router.get("/my-orders", protect, getMyOrders);
router.patch(
  "/:orderId/items/:itemId/cancel",
  protect,
  cancelOrder
);
router.get("/:orderId", protect, getOrderById);
router.post("/", protect, placeOrder);
router.get("/seller/my-orders", protect,sellerOnly, getSellerOrders);

router.patch(
  "/seller/:orderId/items/:itemId/status",
  protect,sellerOnly,
  updateSellerItemStatus
);
module.exports = router;