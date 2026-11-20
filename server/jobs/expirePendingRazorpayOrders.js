
const mongoose = require("mongoose");
const cron = require("node-cron");
const Razorpay = require("razorpay");

const Order = require("../models/Order");
const Product = require("../models/Product");

const EXPIRY_MINUTES = 15;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

let isRunning = false;

const expirePendingRazorpayOrders = async () => {
  if (isRunning) {
    console.log("Expiry scheduler is already running");
    return;
  }

  isRunning = true;

  try {
    console.log("Checking pending Razorpay orders...");

    const expiryTime = new Date(
      Date.now() - EXPIRY_MINUTES * 60 * 1000
    );

    // Find expired pending Razorpay orders.
    const pendingOrders = await Order.find({
      paymentMethod: "RAZORPAY",
      paymentStatus: "pending",
      status: "pending_payment",
      stockReleasedAt: null,
      paymentInitiatedAt: { $lte: expiryTime },
    });

    console.log(
      `Found ${pendingOrders.length} expired candidates`
    );

    for (const order of pendingOrders) {
      try {
        // Fetch all payment attempts from Razorpay.
        const paymentsResponse =
          await razorpay.orders.fetchPayments(
            order.razorpayOrderId
          );

        const payments = paymentsResponse.items || [];

        // Release stock only when there are no payment attempts
        // or every attempt has explicitly failed.
        const allPaymentsFailed =
          payments.length === 0 ||
          payments.every(
            (payment) => payment.status === "failed"
          );

        if (!allPaymentsFailed) {
          console.log(
            `Skipping order ${order._id}: payment requires reconciliation`
          );
          continue;
        }

        const session = await mongoose.startSession();

        try {
          await session.withTransaction(async () => {
            // Atomically claim the order for expiry.
            const expiredOrder =
              await Order.findOneAndUpdate(
                {
                  _id: order._id,
                  paymentMethod: "RAZORPAY",
                  paymentStatus: "pending",
                  status: "pending_payment",
                  stockReleasedAt: null,
                  paymentInitiatedAt: {
                    $lte: expiryTime,
                  },
                },
                {
                  $set: {
                    paymentStatus: "failed",
                    status: "cancelled",
                    stockReleasedAt: new Date(),
                    "items.$[].status": "cancelled",
                    "items.$[].paymentStatus": "failed",
                  },
                },
                {
                  returnDocument: "after",
                  session,
                }
              );

            if (!expiredOrder) {
              console.log(
                `Order ${order._id} was already processed`
              );
              return;
            }

            // Restore product stock inside the transaction.
            for (const item of expiredOrder.items) {
              const productUpdate =
                await Product.updateOne(
                  {
                    _id: item.productId,
                  },
                  {
                    $inc: {
                      stock: item.quantity,
                    },
                  },
                  {
                    session,
                  }
                );

              if (productUpdate.matchedCount !== 1) {
                throw new Error(
                  `Product not found: ${item.productId}`
                );
              }
            }

            console.log(
              `Order ${order._id} expired and stock restored`
            );
          });
        } finally {
          await session.endSession();
        }
      } catch (error) {
        console.error(
          `Failed to process order ${order._id}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Pending Razorpay expiry error:",
      error.message
    );
  } finally {
    isRunning = false;
  }
};

const startRazorpayExpiryScheduler = () => {
  console.log("Razorpay expiry scheduler started");

  cron.schedule("*/5 * * * *", () => {
    expirePendingRazorpayOrders();
  });
};

module.exports = {
  expirePendingRazorpayOrders,
  startRazorpayExpiryScheduler,
};
