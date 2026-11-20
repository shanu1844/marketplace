
require("dotenv").config();

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function checkPayment() {
  try {
    const payment = await razorpay.payments.fetch(
      "pay_TvFpF3PoG9diq5"
    );

    console.log({
      paymentId: payment.id,
      orderId: payment.order_id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      captured: payment.captured,
    });
  } catch (error) {
    console.error("Payment fetch failed:", error.message);
  }
}

checkPayment();
