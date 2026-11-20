const express = require("express");
const router = express.Router();

const {
  razorpayWebhook,
} = require("../controllers/webhookController");

router.post(
  "/",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

module.exports = router;