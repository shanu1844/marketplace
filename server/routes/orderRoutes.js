
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { sellerOnly } = require("../middleware/sellerMiddleware");
const {adminOnly} = require("../middleware/adminMiddleware");

const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  updateSellerItemStatus,
  collectSellerItemPayment,
  requestItemReturn,
  reviewSellerReturnRequest,
  getSellerReturnRequests,
  markReturnReceived,
   markRefundCompleted,
   submitRefundDetails,
   createRazorpayOrder,
   verifyRazorpayPayment,
   reconcileRazorpayPayment,
   initiateRazorpayRefund,
    cancelRazorpayOrder,
} = require("../controllers/orderController");

// ==========================================
// BUYER ROUTES
// ==========================================

// Place a new order
router.post("/", protect, placeOrder);
// Razorpay payment routes
router.post(
  "/razorpay/create-order",
  protect,
  createRazorpayOrder
);

router.post(
  "/razorpay/verify-payment",
  protect,
  verifyRazorpayPayment
);

router.post(
  "/razorpay/cancel-order",
  protect,
  cancelRazorpayOrder
);

router.post(
  "/razorpay/reconcile-payment",
  protect,
  adminOnly,
  reconcileRazorpayPayment
);

// Get buyer's orders
router.get("/my-orders", protect, getMyOrders);

// Get seller-independent order details for buyer
router.get("/:orderId", protect, getOrderById);

// Cancel an order item
router.patch(
  "/:orderId/items/:itemId/cancel",
  protect,
  cancelOrder
);

// Request return for an order item
router.patch(
  "/:orderId/items/:itemId/return",
  protect,
  requestItemReturn
);

// ==========================================
// SELLER ROUTES
// ==========================================

// Get seller's orders
router.get(
  "/seller/my-orders",
  protect,
  sellerOnly,
  getSellerOrders
);

// Get seller's return requests
router.get(
  "/seller/return-requests",
  protect,
  sellerOnly,
  getSellerReturnRequests
);

// Update order item status
router.patch(
  "/seller/:orderId/items/:itemId/status",
  protect,
  sellerOnly,
  updateSellerItemStatus
);

// Collect COD payment
router.patch(
  "/seller/:orderId/items/:itemId/payment",
  protect,
  sellerOnly,
  collectSellerItemPayment
);

// Approve or reject return request
router.patch(
  "/seller/:orderId/items/:itemId/return",
  protect,
  sellerOnly,
  reviewSellerReturnRequest
);

router.patch(
  "/seller/:orderId/items/:itemId/return-received",
  protect,
  sellerOnly,
  markReturnReceived
);

router.patch(
  "/seller/:orderId/items/:itemId/refund",
  protect,
  sellerOnly,
  markRefundCompleted
);

router.patch(
  "/:orderId/items/:itemId/refund-details",
  protect,
  submitRefundDetails
);
router.post(
  "/seller/:orderId/items/:itemId/razorpay-refund",
  protect,
  sellerOnly,
  initiateRazorpayRefund
);

module.exports = router;
