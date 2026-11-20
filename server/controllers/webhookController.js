
const crypto = require("crypto");
const Order = require("../models/Order");

const sendResponse = (res, status, success, message) => {
  return res.status(status).json({ success, message });
};

const razorpayWebhook = async (req, res) => {
  console.log("🔔 RAZORPAY WEBHOOK RECEIVED");
console.log("========== RAZORPAY WEBHOOK HIT ==========");
console.log("Method:", req.method);
console.log("URL:", req.originalUrl);
console.log("Signature received:", !!req.headers["x-razorpay-signature"]);
console.log("Body type:", Buffer.isBuffer(req.body) ? "Buffer" : typeof req.body);
  try {
    // 1. Verify webhook configuration and raw request body
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is missing");
      return sendResponse(res, 500, false, "Webhook configuration error");
    }

    if (
      !signature ||
      !Buffer.isBuffer(req.body) ||
      !/^[a-f0-9]{64}$/i.test(signature)
    ) {
      return sendResponse(res, 400, false, "Invalid webhook request");
    }

    // 2. Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    const receivedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return sendResponse(res, 400, false, "Invalid webhook signature");
    }

    // 3. Parse verified event
    const event = JSON.parse(req.body.toString("utf8"));

    console.log("Razorpay webhook received:", event.event);

    // --------------------------------------------------
    // REFUND EVENTS
    // --------------------------------------------------

    if (
      event.event === "refund.processed" ||
      event.event === "refund.failed"
    ) {
      const refund = event.payload?.refund?.entity;

      if (!refund?.id || !refund?.payment_id) {
        console.error("Invalid Razorpay refund payload");

        return sendResponse(
          res,
          200,
          true,
          "Invalid refund event acknowledged"
        );
      }

      const { orderId, itemId } = refund.notes || {};

      if (!orderId || !itemId) {
        console.error(
          "Refund event missing orderId/itemId:",
          refund.id
        );

        return sendResponse(
          res,
          200,
          true,
          "Refund identifiers missing; manual review required"
        );
      }

      const order = await Order.findOne({
        _id: orderId,
        paymentMethod: "RAZORPAY",
        razorpayPaymentId: refund.payment_id,
        items: {
          $elemMatch: { _id: itemId },
        },
      });

      if (!order) {
        console.error("Refund order/item not found:", refund.id);

        return sendResponse(
          res,
          500,
          false,
          "Refund order not found; retry required"
        );
      }

      const item = order.items.id(itemId);

      if (!item) {
        return sendResponse(
          res,
          500,
          false,
          "Refund item not found; retry required"
        );
      }

      // Verify refund amount (Razorpay amount is in paise)
      const expectedRefundAmount = Math.round(
        Number(item.refundAmount || 0) * 100
      );

      if (
        !Number.isFinite(expectedRefundAmount) ||
        refund.amount !== expectedRefundAmount
      ) {
        console.error("Refund amount mismatch:", refund.id);

        return sendResponse(
          res,
          200,
          true,
          "Refund amount mismatch; manual review required"
        );
      }

      // Prevent a different refund ID from overwriting the existing one
      if (
        item.razorpayRefundId &&
        item.razorpayRefundId !== refund.id
      ) {
        console.error("Refund ID mismatch:", refund.id);

        return sendResponse(
          res,
          200,
          true,
          "Refund ID mismatch; manual review required"
        );
      }

      // A completed refund must never be downgraded to failed
      if (
        item.refundStatus === "refunded" &&
        event.event === "refund.failed"
      ) {
        return sendResponse(
          res,
          200,
          true,
          "Refund already completed"
        );
      }

      // Idempotent duplicate delivery protection
      if (
        item.razorpayRefundId === refund.id &&
        (
          (event.event === "refund.processed" &&
            item.refundStatus === "refunded") ||
          (event.event === "refund.failed" &&
            item.refundStatus === "failed")
        )
      ) {
        return sendResponse(
          res,
          200,
          true,
          "Refund event already processed"
        );
      }

      // Update item-level refund details
      item.razorpayRefundId = refund.id;

      if (event.event === "refund.processed") {
        item.refundStatus = "refunded";
        item.refundedAt = new Date();
        item.refundMethod = "RAZORPAY";
      } else {
        item.refundStatus = "failed";
        item.refundMethod = "RAZORPAY";
      }

      // --------------------------------------------------
      // UPDATED ORDER-LEVEL REFUND AGGREGATION
      // --------------------------------------------------

      // Find all paid items in this order
      const paidItems = order.items.filter(
        (orderItem) => orderItem.paymentStatus === "paid"
      );

      // Find items for which a refund has actually been requested
      const refundableItems = paidItems.filter(
        (orderItem) =>
          Number(orderItem.refundAmount || 0) > 0 &&
          orderItem.refundStatus !== "not_applicable"
      );

      const allRefundsCompleted =
        refundableItems.length > 0 &&
        refundableItems.every(
          (orderItem) => orderItem.refundStatus === "refunded"
        );

      const anyRefundFailed = refundableItems.some(
        (orderItem) => orderItem.refundStatus === "failed"
      );

      const anyRefundInProgress = refundableItems.some(
        (orderItem) =>
          orderItem.refundStatus === "pending" ||
          orderItem.refundStatus === "processing"
      );

      // An order is fully refunded only when every paid item is refunded
      const allPaidItemsRefunded =
        paidItems.length > 0 &&
        paidItems.every(
          (orderItem) => orderItem.refundStatus === "refunded"
        );

      // Synchronize order-level refund tracking
      if (anyRefundInProgress) {
        order.razorpayRefundStatus = "pending";
        order.paymentReconciliationStatus = "refund_pending";
      } else if (anyRefundFailed) {
        order.razorpayRefundStatus = "failed";
        order.paymentReconciliationStatus = "refund_pending";
      } else if (allRefundsCompleted) {
        order.razorpayRefundStatus = "processed";

        if (allPaidItemsRefunded) {
          order.paymentStatus = "refunded";
          order.paymentReconciliationStatus = "refunded";
        } else {
          // Partial refund: other paid items still remain
          order.paymentStatus = "paid";
          order.paymentReconciliationStatus = "resolved";
        }
      }

      // Order schema has one order-level refund ID.
      // Keep it only when there is a single refundable item.
      if (refundableItems.length === 1) {
        order.razorpayRefundId = refund.id;
      }

      await order.save();

      console.log("Razorpay refund synchronized:", {
        orderId: order._id,
        itemId: item._id,
        refundId: refund.id,
        event: event.event,
        itemRefundStatus: item.refundStatus,
        orderRefundStatus: order.razorpayRefundStatus,
        paymentStatus: order.paymentStatus,
      });

      return sendResponse(
        res,
        200,
        true,
        "Refund status synchronized successfully"
      );
    }

    // Ignore events that this controller does not handle
    if (event.event !== "payment.captured") {
      return sendResponse(res, 200, true, "Event acknowledged");
    }

    // --------------------------------------------------
    // CAPTURED PAYMENT EVENT
    // --------------------------------------------------

    const payment = event.payload?.payment?.entity;

    if (!payment || payment.status !== "captured") {
      return sendResponse(res, 200, true, "Invalid payment event ignored");
    }

    const {
      id: razorpayPaymentId,
      order_id: razorpayOrderId,
      amount,
      currency,
      created_at: createdAt,
    } = payment;

    if (!razorpayPaymentId || !razorpayOrderId) {
      return sendResponse(res, 200, true, "Payment identifiers missing");
    }

    // Find marketplace order
    const order = await Order.findOne({
      razorpayOrderId,
      paymentMethod: "RAZORPAY",
    });

    if (!order) {
      console.error("Marketplace order not found:", razorpayOrderId);
      return sendResponse(res, 200, true, "Unknown order event acknowledged");
    }

    // Duplicate webhook for the same captured payment
    if (
      order.paymentStatus === "paid" &&
      order.razorpayPaymentId === razorpayPaymentId
    ) {
      return sendResponse(res, 200, true, "Payment already processed");
    }

    // Do not overwrite a different payment ID
    if (
      order.razorpayPaymentId &&
      order.razorpayPaymentId !== razorpayPaymentId
    ) {
      console.error("Different captured payment ID for order:", {
        orderId: order._id,
        existingPaymentId: order.razorpayPaymentId,
        receivedPaymentId: razorpayPaymentId,
      });

      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            paymentReconciliationStatus: "review_required",
          },
        }
      );

      return sendResponse(
        res,
        200,
        true,
        "Additional payment requires manual review"
      );
    }

    const capturedAt = createdAt
      ? new Date(createdAt * 1000)
      : new Date();

    const capturedAmount = amount / 100;
    const expectedAmount = Math.round(Number(order.totalAmount) * 100);

    const amountMatches =
      Number.isFinite(expectedAmount) &&
      amount === expectedAmount;

    const currencyMatches = currency === "INR";

    // 4. Amount/currency mismatch:
    // Payment was captured, but order needs manual reconciliation.
    if (!amountMatches || !currencyMatches) {
      console.error("Payment amount/currency mismatch:", order._id);

      await Order.updateOne(
        {
          _id: order._id,
          paymentMethod: "RAZORPAY",
          $or: [
            { razorpayPaymentId: null },
            { razorpayPaymentId: { $exists: false } },
            { razorpayPaymentId },
          ],
        },
        {
          $set: {
            paymentStatus: "paid",
            "items.$[].paymentStatus": "paid",
            razorpayPaymentId,
            razorpayCapturedAt: capturedAt,
            razorpayCapturedAmount: capturedAmount,
            paymentReconciliationStatus: "review_required",
          },
        }
      );

      return sendResponse(
        res,
        200,
        true,
        "Payment mismatch recorded for reconciliation"
      );
    }

    // 5. Late payment / cancelled order / released stock
    if (
      order.stockReleasedAt ||
      order.status !== "pending_payment" ||
      order.paymentStatus === "failed" ||
      order.paymentStatus === "refunded"
    ) {
      console.error("Late captured payment requires reconciliation:", order._id);

      await Order.updateOne(
        {
          _id: order._id,
          paymentMethod: "RAZORPAY",
          $or: [
            { razorpayPaymentId: "" },
            { razorpayPaymentId: null },
            { razorpayPaymentId: { $exists: false } },
            { razorpayPaymentId },
          ],
        },
        {
          $set: {
            paymentStatus: "paid",
            "items.$[].paymentStatus": "paid",
            razorpayPaymentId,
            razorpayCapturedAt: capturedAt,
            razorpayCapturedAmount: capturedAmount,
            paymentReconciliationStatus: "review_required",
          },
        }
      );

      // Do not place the order or restore stock automatically.
      return sendResponse(
        res,
        200,
        true,
        "Late payment recorded for reconciliation"
      );
    }

    // 6. Atomically confirm a valid pending payment
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        paymentMethod: "RAZORPAY",
        paymentStatus: "pending",
        status: "pending_payment",
        stockReleasedAt: null,
        $or: [
          { razorpayPaymentId: null },
          { razorpayPaymentId: { $exists: false } },
          { razorpayPaymentId },
        ],
      },
      {
        $set: {
          paymentStatus: "paid",
          status: "placed",
          razorpayPaymentId,
          razorpayCapturedAt: capturedAt,
          razorpayCapturedAmount: capturedAmount,
          paymentReconciliationStatus: "not_required",
          "items.$[].paymentStatus": "paid",
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      // Another process may have changed the order
      const latestOrder = await Order.findById(order._id);

      if (
        latestOrder &&
        latestOrder.paymentStatus === "paid" &&
        latestOrder.razorpayPaymentId === razorpayPaymentId
      ) {
        return sendResponse(
          res,
          200,
          true,
          "Payment already processed"
        );
      }

      console.error(
        "Payment needs reconciliation after concurrent update:",
        order._id
      );

      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            paymentReconciliationStatus: "review_required",
          },
        }
      );

      return sendResponse(
        res,
        200,
        true,
        "Payment requires reconciliation"
      );
    }

    console.log(
      "Razorpay payment captured successfully:",
      updatedOrder._id
    );

    return sendResponse(
      res,
      200,
      true,
      "Payment captured successfully"
    );

  } catch (error) {
    console.error("Razorpay webhook error:", error);

    // 500 allows Razorpay to retry failed processing
    return sendResponse(
      res,
      500,
      false,
      "Webhook processing failed"
    );
  }
};

module.exports = {
  razorpayWebhook,
};
