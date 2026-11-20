
require("dotenv").config();

const crypto = require("crypto");

const orderId = "order_U0Maoxufm75vGD";

const payload = {
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_TEST_LATE_CAPTURE_001",
        order_id: orderId,
        amount: 10000,
        currency: "INR",
        status: "captured",
        created_at: Math.floor(Date.now() / 1000),
      },
    },
  },
};

const rawBody = JSON.stringify(payload);

const signature = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest("hex");

const sendTestWebhook = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/webhooks/razorpay",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": signature,
        },
        body: rawBody,
      }
    );

    const result = await response.json();

    console.log("HTTP Status:", response.status);
    console.log("Webhook Response:", result);
  } catch (error) {
    console.error("Error:", error);
  console.error("Cause:", error.cause);
  }
};

if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.error("RAZORPAY_WEBHOOK_SECRET missing in .env");
  process.exit(1);
}

sendTestWebhook();
