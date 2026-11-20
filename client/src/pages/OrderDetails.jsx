
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import api from "../services/api";

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/orders/${orderId}`);

        if (!ignore) {
          setOrder(response.data.order || null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "Unable to fetch order details."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();

    return () => {
      ignore = true;
    };
  }, [orderId]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusStyle = (status) => {
    const value = status?.toLowerCase();

    if (value === "delivered") {
      return "bg-green-100 text-green-700";
    }

    if (value === "shipped" || value === "confirmed") {
      return "bg-blue-100 text-blue-700";
    }

    if (value === "cancelled" || value === "failed") {
      return "bg-red-100 text-red-700";
    }

    if (value === "paid") {
      return "bg-green-100 text-green-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // Order tracking steps
  const trackingSteps = [
    { label: "Order Placed", status: "placed" },
    { label: "Confirmed", status: "confirmed" },
    { label: "Shipped", status: "shipped" },
    { label: "Delivered", status: "delivered" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F7F5EF]">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto animate-spin text-[#174B38]"
          />
          <p className="mt-3 text-sm text-[#73786F]">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F7F5EF] px-4">
        <div className="max-w-md rounded-2xl border border-[#E7E4DB] bg-white p-8 text-center">
          <p className="font-semibold text-red-600">
            {error || "Order not found."}
          </p>

          <Link
            to="/my-orders"
            className="mt-5 inline-flex rounded-lg bg-[#174B38] px-5 py-2.5 text-sm font-semibold text-white! hover:bg-[#103729]"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <Link
          to="/my-orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#174B38] hover:underline"
        >
          <ArrowLeft size={17} />
          Back to My Orders
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#174B38] sm:text-3xl">
            Order Details
          </h1>

          <p className="mt-2 text-sm text-[#73786F]">
            Order ID: #{order._id?.slice(-8).toUpperCase()}
          </p>

          <p className="mt-1 text-sm text-[#73786F]">
            Placed on: {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Order Status */}
        <div className="mb-6 rounded-2xl border border-[#E7E4DB] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[#73786F]">
                Overall Order Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(order.status)}`}
              >
                {formatStatus(order.status)}
              </span>
            </div>

            <div>
              <p className="text-sm text-[#73786F]">
                Payment Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(order.paymentStatus)}`}
              >
                {formatStatus(order.paymentStatus)}
              </span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#E7E4DB] bg-white">
          <div className="flex items-center gap-2 border-b border-[#E7E4DB] p-5">
            <Package size={20} className="text-[#174B38]" />

            <h2 className="font-bold text-[#174B38]">
              Ordered Products
            </h2>
          </div>

          <div className="space-y-4 p-5">
            {order.items?.map((item, index) => (
              <div
                key={item._id || index}
                className="border-b border-[#E7E4DB] pb-5 last:border-0 last:pb-0"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                  {/* Product Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F7F5EF]">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#73786F]">
                        <ShoppingBag size={25} />
                      </div>
                    )}
                  </div>

                  {/* Product Information */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#252923]">
                      {item.productName || "Product"}
                    </h3>

                    <p className="mt-1 text-sm text-[#73786F]">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-1 text-sm text-[#73786F]">
                      Price: ₹{(item.price || 0).toLocaleString("en-IN")}
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(item.status)}`}
                    >
                      {formatStatus(item.status)}
                    </span>
                  </div>

                  {/* Item Total */}
                  <div className="sm:text-right">
                    <p className="text-xs text-[#73786F]">
                      Item Total
                    </p>

                    <p className="mt-1 font-bold text-[#174B38]">
                      ₹
                      {(
                        (item.price || 0) * (item.quantity || 0)
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Order Tracking Timeline */}
                {item.status === "cancelled" ? (
                  <p className="mt-4 text-sm font-semibold text-red-600">
                    This item has been cancelled.
                  </p>
                ) : (
                  <div className="mt-6 rounded-xl bg-[#F7F5EF] p-4">
                    <p className="mb-5 text-xs font-bold tracking-wide text-[#73786F]">
                      ORDER TRACKING
                    </p>

                    <div className="grid grid-cols-4 gap-2">
                      {trackingSteps.map((step, stepIndex) => {
                        const currentStep = trackingSteps.findIndex(
                          (trackingStep) =>
                            trackingStep.status === item.status
                        );

                        const isCompleted =
                          currentStep !== -1 &&
                          stepIndex <= currentStep;

                        return (
                          <div
                            key={step.status}
                            className="relative text-center"
                          >
                            <div
                              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                isCompleted
                                  ? "bg-[#174B38] text-white"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {isCompleted ? "✓" : stepIndex + 1}
                            </div>

                            <p
                              className={`mt-2 text-[10px] sm:text-xs ${
                                isCompleted
                                  ? "font-semibold text-[#174B38]"
                                  : "text-[#73786F]"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6 rounded-2xl border border-[#E7E4DB] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-[#174B38]" />

            <h2 className="font-bold text-[#174B38]">
              Shipping Address
            </h2>
          </div>

          <div className="space-y-1 text-sm text-[#73786F]">
            <p className="font-semibold text-[#252923]">
              {order.shippingAddress?.fullName}
            </p>

            <p>{order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.addressLine}</p>

            <p>
              {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state} -{" "}
              {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="rounded-2xl border border-[#E7E4DB] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-[#174B38]" />

            <h2 className="font-bold text-[#174B38]">
              Payment Summary
            </h2>
          </div>

          <div className="flex justify-between border-b border-[#E7E4DB] py-3 text-sm">
            <span className="text-[#73786F]">
              Payment Method
            </span>

            <span className="font-semibold text-[#252923]">
              {order.paymentMethod || "COD"}
            </span>
          </div>

          <div className="flex justify-between border-b border-[#E7E4DB] py-3 text-sm">
            <span className="text-[#73786F]">
              Payment Status
            </span>

            <span className="font-semibold text-[#252923]">
              {formatStatus(order.paymentStatus)}
            </span>
          </div>

          <div className="flex justify-between pt-4">
            <span className="font-semibold text-[#252923]">
              Total Amount
            </span>

            <span className="text-xl font-bold text-[#174B38]">
              ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrderDetails;
