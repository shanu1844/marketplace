
const express = require("express");

const {
  submitSellerApplication,
  getMySellerApplication,
  getAllSellerApplications,
  updateSellerApplicationStatus,
} = require("../controllers/sellerController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Seller application routes
router.post("/apply", protect, submitSellerApplication);
router.get("/my-application", protect, getMySellerApplication);

// Admin-only routes
router.get(
  "/applications",
  protect,
  adminOnly,
  getAllSellerApplications
);

router.patch(
  "/applications/:applicationId/status",
  protect,
  adminOnly,
  updateSellerApplicationStatus
);

module.exports = router;
