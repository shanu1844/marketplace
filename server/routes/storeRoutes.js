const express = require("express");

const {
  createStore,
  getMyStore,
  updateMyStore,
  updateStoreStatus,
} = require("../controllers/storeController");
const { protect } = require("../middleware/authMiddleware");
const { sellerOnly } = require("../middleware/sellerMiddleware");

const router = express.Router();

router.post("/", protect, sellerOnly, createStore);

router.get("/my-store", protect, sellerOnly, getMyStore);

router.patch("/my-store", protect, sellerOnly, updateMyStore);

router.patch("/my-store/status", protect, sellerOnly, updateStoreStatus);

module.exports = router;
