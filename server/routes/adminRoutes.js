const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {
  getAdminDashboardStats,
  getAdminUsers, getAdminProducts,updateAdminProductStatus,
deleteAdminProduct,getAdminOrders,getAdminReturnRequests,
} = require("../controllers/adminController");

// Admin dashboard statistics
router.get("/dashboard/stats", protect, adminOnly, getAdminDashboardStats);

// Get all marketplace users
router.get("/users", protect, adminOnly, getAdminUsers);
// Admin products management
router.get(
  "/products",
  protect,
  adminOnly,
  getAdminProducts
);
router.patch(
  "/products/:productId/status",
  protect,
  adminOnly,
  updateAdminProductStatus
);

router.delete(
  "/products/:productId",
  protect,
  adminOnly,
  deleteAdminProduct
);
router.get(
  "/orders",
  protect,
  adminOnly,
  getAdminOrders
);
router.get("/returns", protect, adminOnly, getAdminReturnRequests);

module.exports = router;
