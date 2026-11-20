import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PackageCheck,
  ShoppingBag,
  RefreshCw,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Wallet,
  ChevronRight,
  Package,
  CircleAlert,
  Banknote,
} from "lucide-react";
import api from "../services/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingItemId, setCancellingItemId] = useState(null);
  const [returningItemId, setReturningItemId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [refundForms, setRefundForms] = useState({});
  const [submittingRefundItemId, setSubmittingRefundItemId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/my-orders");
      const orderData = response.data?.orders || response.data?.data || [];

      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to fetch your orders. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders/my-orders");
        const orderData = response.data?.orders || response.data?.data || [];

        if (!ignore) {
          setOrders(Array.isArray(orderData) ? orderData : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "Unable to fetch your orders. Please try again.",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
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

    if (["delivered", "completed", "approved", "refunded"].includes(value)) {
      return "bg-[#E6F1E6] text-[#28613D] border-[#D2E5D2]";
    }

    if (["shipped", "confirmed", "paid"].includes(value)) {
      return "bg-[#E8EFF8] text-[#355C91] border-[#D8E4F3]";
    }

    if (["cancelled", "rejected", "failed"].includes(value)) {
      return "bg-[#FCEAEA] text-[#B34343] border-[#F3D6D6]";
    }

    return "bg-[#F8F0DD] text-[#94712D] border-[#EEE2C5]";
  };

  const handleCancelItem = async (orderId, itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this item?",
    );

    if (!confirmed) return;

    try {
      setCancellingItemId(itemId);

      await api.patch(`/orders/${orderId}/items/${itemId}/cancel`);

      await fetchOrders();
      alert("Item cancelled successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to cancel this item. Please try again.",
      );
    } finally {
      setCancellingItemId(null);
    }
  };

  const handleReturnRequest = async (orderId, itemId) => {
    if (!returnReason) {
      alert("Please select a return reason.");
      return;
    }

    try {
      setReturningItemId(itemId);

      await api.patch(`/orders/${orderId}/items/${itemId}/return`, {
        reason: returnReason,
        description: returnDescription,
      });

      alert("Return request submitted successfully!");

      setReturnReason("");
      setReturnDescription("");

      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to submit return request.");
    } finally {
      setReturningItemId(null);
    }
  };

  const handleRefundDetailsSubmit = async (orderId, itemId) => {
    const form = refundForms[itemId] || {};

    const {
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      bankName,
    } = form;

    if (
      !accountHolderName?.trim() ||
      !accountNumber?.trim() ||
      !confirmAccountNumber?.trim() ||
      !ifscCode?.trim() ||
      !bankName?.trim()
    ) {
      alert("Please fill all bank details.");
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      alert("Account numbers do not match.");
      return;
    }

    if (!/^\d{9,18}$/.test(accountNumber)) {
      alert("Please enter a valid account number.");
      return;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscCode)) {
      alert("Please enter a valid IFSC code.");
      return;
    }

    try {
      setSubmittingRefundItemId(itemId);

      await api.patch(`/orders/${orderId}/items/${itemId}/refund-details`, {
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        bankName: bankName.trim(),
      });

      alert("Bank details submitted successfully!");
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to submit bank details.");
    } finally {
      setSubmittingRefundItemId(null);
    }
  };

  const orderCount = orders.length;

  const totalSpent = orders.reduce(
    (sum, order) => sum + (Number(order.totalAmount) || 0),
    0,
  );

  const totalItems = orders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemSum, item) => itemSum + (Number(item.quantity) || 0),
        0,
      ),
    0,
  );

  const inputClass =
    "w-full rounded-xl border border-[#E7E4DB] bg-[#FCFBF8] px-4 py-3 text-sm text-[#252923] outline-none transition placeholder:text-[#A0A39B] focus:border-[#174B38] focus:ring-0";

  const fieldLabel =
    "mb-2 block text-xs font-semibold tracking-wide text-[#526354]";

  const statCards = [
    {
      label: "Total orders",
      value: orderCount,
      icon: PackageCheck,
    },
    {
      label: "Items purchased",
      value: totalItems,
      icon: ShoppingBag,
    },
    {
      label: "Total order value",
      value: `₹${totalSpent.toLocaleString("en-IN")}`,
      icon: Wallet,
    },
  ];

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#F7F5EF]">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#E4EBE3]">
            <RefreshCw size={25} className="animate-spin text-[#174B38]" />
          </div>
          <p className="mt-4 text-sm font-medium text-[#526354]">
            Loading your orders...
          </p>
          <p className="mt-1 text-xs text-[#969B91]">
            Getting your latest purchases
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#F7F5EF] px-4">
        <div className="w-full max-w-md rounded-3xl border border-[#E7E4DB] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <CircleAlert size={25} />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-[#183A2D]">
            Couldn't load your orders
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#73786F]">{error}</p>

          <button
            onClick={fetchOrders}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174B38] px-6 py-3 text-sm font-semibold text-white! transition hover:bg-[#103729]"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  // EMPTY ORDERS
  if (orders.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#F7F5EF] px-4 py-16">
        <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
          <div className="relative mb-7">
            <div className="flex size-28 items-center justify-center rounded-4xl bg-[#E4EBE3] text-[#174B38]">
              <ShoppingBag size={45} strokeWidth={1.5} />
            </div>
            <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-full border-4 border-[#F7F5EF] bg-white text-[#719078]">
              <Package size={17} />
            </span>
          </div>

          <span className="rounded-full bg-white px-4 py-2 text-[10px] font-bold tracking-[0.17em] text-[#719078]">
            YOUR ORDER HISTORY
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#183A2D]">
            Your journey starts here.
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-7 text-[#73786F]">
            You haven't placed any orders yet. Discover something special and
            your purchases will appear here.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#174B38] px-7 py-3 text-sm font-semibold text-white! transition hover:-translate-y-0.5 hover:bg-[#103729]"
          >
            Explore products
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* PAGE HEADER */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-[#123D2E] p-6 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-14 size-48 rounded-full border border-white/10" />

          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[#D3E3CD]">
                <PackageCheck size={13} />
                YOUR SHOPPING JOURNEY
              </span>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                My Orders
              </h1>

              <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
                All your purchases, in one place. Track deliveries, manage
                returns and stay updated on your orders.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#DCE9D6] px-5 py-3 text-sm font-semibold text-[#123D2E] transition hover:-translate-y-0.5 hover:bg-white"
            >
              Continue shopping
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>

        {/* ORDER OVERVIEW */}
        <section className="mb-9 grid gap-4 sm:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl border border-[#E7E4DB] bg-white p-5 shadow-sm"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38]">
                  <Icon size={21} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-[#858A80]">{stat.label}</p>
                  <p className="mt-1 truncate text-xl font-semibold text-[#183A2D]">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* SECTION TITLE */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#719078]">
              PURCHASE HISTORY
            </span>
            <h2 className="mt-1 text-xl font-semibold text-[#183A2D]">
              Your recent orders
            </h2>
          </div>

          <span className="rounded-full border border-[#E7E4DB] bg-white px-4 py-2 text-xs font-medium text-[#73786F]">
            {orderCount} {orderCount === 1 ? "order" : "orders"}
          </span>
        </div>

        {/* ORDERS LIST */}
        <div className="space-y-6">
          {orders.map((order) => (
            <article
              key={order._id}
              className="overflow-hidden rounded-3xl border border-[#E7E4DB] bg-white shadow-sm transition hover:shadow-md"
            >
              {/* ORDER HEADER */}
              <div className="border-b border-[#E7E4DB] bg-[#FCFBF8] p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div className="grid grid-cols-2 gap-x-7 gap-y-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-[#92978D]">
                        ORDER ID
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-[#183A2D]">
                        #{order._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#92978D]">
                        <CalendarDays size={12} />
                        ORDER DATE
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-[#252923]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#92978D]">
                        <CreditCard size={12} />
                        PAYMENT METHOD
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-[#252923]">
                        {order.paymentMethod || "COD"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <span className="text-xs text-[#858A80]">Order status</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(order.status)}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div className="divide-y divide-[#E7E4DB] px-5 sm:px-6">
                {order.items?.map((item, index) => (
                  <div key={item._id || index} className="py-6">
                    {/* PRODUCT SUMMARY */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="size-24 shrink-0 overflow-hidden rounded-2xl border border-[#E7E4DB] bg-[#F7F5EF] sm:size-28">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName || "Product"}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[#829080]">
                            <ShoppingBag size={28} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-[#183A2D]">
                            {item.productName || "Product"}
                          </h3>

                          {item.status && (
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(item.status)}`}
                            >
                              {formatStatus(item.status)}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#858A80]">
                          <span>Quantity: {item.quantity}</span>
                          <span>
                            Unit price: ₹
                            {(item.price || 0).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <p className="mt-3 text-lg font-bold text-[#174B38]">
                          ₹
                          {(
                            (item.price || 0) * (item.quantity || 0)
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* ITEM ACTIONS */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {item.status === "placed" && (
                        <button
                          onClick={() => handleCancelItem(order._id, item._id)}
                          disabled={cancellingItemId === item._id}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={15} />
                          {cancellingItemId === item._id
                            ? "Cancelling..."
                            : "Cancel item"}
                        </button>
                      )}
                    </div>

                    {/* RETURN REQUEST */}
                    {item.status === "delivered" &&
                      item.returnStatus === "not_requested" && (
                        <div className="mt-5 rounded-2xl border border-[#E7E4DB] bg-[#FCFBF8] p-5">
                          <div className="mb-4 flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38]">
                              <RotateCcw size={19} />
                            </span>
                            <div>
                              <h4 className="text-sm font-semibold text-[#183A2D]">
                                Request a return
                              </h4>
                              <p className="mt-0.5 text-xs text-[#858A80]">
                                Tell us why you want to return this item.
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className={fieldLabel}>
                                RETURN REASON
                              </label>
                              <select
                                value={returnReason}
                                onChange={(e) =>
                                  setReturnReason(e.target.value)
                                }
                                className={inputClass}
                              >
                                <option value="">Select return reason</option>
                                <option value="damaged">Damaged Product</option>
                                <option value="wrong_product">
                                  Wrong Product
                                </option>
                                <option value="quality_issue">
                                  Quality Issue
                                </option>
                                <option value="size_issue">Size Issue</option>
                                <option value="missing_parts">
                                  Missing Parts
                                </option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <div>
                              <label className={fieldLabel}>
                                ADDITIONAL DETAILS
                              </label>
                              <textarea
                                value={returnDescription}
                                onChange={(e) =>
                                  setReturnDescription(e.target.value)
                                }
                                placeholder="Describe your issue..."
                                rows={2}
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleReturnRequest(order._id, item._id)
                            }
                            disabled={returningItemId === item._id}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#174B38] px-5 py-3 text-xs font-semibold text-white! transition hover:bg-[#103729] disabled:opacity-50"
                          >
                            {returningItemId === item._id
                              ? "Submitting..."
                              : "Submit return request"}
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      )}

                    {/* RETURN STATUS */}
                    {item.returnStatus &&
                      item.returnStatus !== "not_requested" && (
                        <div className="mt-5 rounded-2xl border border-[#E7E4DB] bg-[#FCFBF8] p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="flex size-10 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38]">
                                <RotateCcw size={18} />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-[#183A2D]">
                                  Return request
                                </p>
                                <p className="mt-0.5 text-xs text-[#858A80]">
                                  {item.returnReason
                                    ? `Reason: ${formatStatus(item.returnReason)}`
                                    : "Your return request information"}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(item.returnStatus)}`}
                            >
                              {formatStatus(item.returnStatus)}
                            </span>
                          </div>
                        </div>
                      )}

                    {/* REFUND BANK DETAILS */}
                    {order.paymentMethod === "COD" &&
                      item.returnStatus === "completed" &&
                      item.returnReceivedAt &&
                      item.paymentStatus === "paid" &&
                      item.refundStatus === "pending" && (
                        <div className="mt-5 rounded-2xl border border-[#DCE5D9] bg-[#F7F9F5] p-5">
                          <div className="mb-5 flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#174B38]">
                              <Banknote size={21} />
                            </span>
                            <div>
                              <h4 className="text-sm font-semibold text-[#183A2D]">
                                Bank details for refund
                              </h4>
                              <p className="mt-1 text-xs leading-5 text-[#73786F]">
                                Provide your bank details so the refund can be
                                processed.
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            {[
                              {
                                name: "accountHolderName",
                                label: "Account holder name",
                                placeholder: "Enter account holder name",
                              },
                              {
                                name: "accountNumber",
                                label: "Account number",
                                placeholder: "Enter account number",
                              },
                              {
                                name: "confirmAccountNumber",
                                label: "Confirm account number",
                                placeholder: "Re-enter account number",
                              },
                              {
                                name: "ifscCode",
                                label: "IFSC code",
                                placeholder: "Example: SBIN0001234",
                              },
                              {
                                name: "bankName",
                                label: "Bank name",
                                placeholder: "Enter bank name",
                              },
                            ].map((field) => (
                              <div key={field.name}>
                                <label className={fieldLabel}>
                                  {field.label.toUpperCase()}
                                </label>

                                <input
                                  type={
                                    field.name === "accountNumber" ||
                                    field.name === "confirmAccountNumber"
                                      ? "password"
                                      : "text"
                                  }
                                  autoComplete="off"
                                  value={
                                    refundForms[item._id]?.[field.name] ??
                                    (field.name === "confirmAccountNumber"
                                      ? ""
                                      : item.refundDetails?.[field.name] || "")
                                  }
                                  onChange={(e) =>
                                    setRefundForms((prev) => ({
                                      ...prev,
                                      [item._id]: {
                                        ...prev[item._id],
                                        [field.name]:
                                          field.name === "ifscCode"
                                            ? e.target.value.toUpperCase()
                                            : e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder={field.placeholder}
                                  className={inputClass}
                                />
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() =>
                              handleRefundDetailsSubmit(order._id, item._id)
                            }
                            disabled={submittingRefundItemId === item._id}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3 text-sm font-semibold text-white! transition hover:bg-[#103729] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                          >
                            {submittingRefundItemId === item._id
                              ? "Submitting..."
                              : item.refundDetailsSubmittedAt
                                ? "Update bank details"
                                : "Submit bank details"}
                            <ArrowRight size={16} />
                          </button>

                          {item.refundDetailsSubmittedAt && (
                            <p className="mt-3 flex items-center gap-2 text-xs text-[#456B50]">
                              <CheckCircle2 size={14} />
                              Bank details submitted. You can update them before
                              the refund is completed.
                            </p>
                          )}
                        </div>
                      )}


{/* REFUND INFORMATION */}
{item.refundStatus &&
  item.refundStatus !== "not_applicable" && (
    <div className="mt-5 rounded-2xl border border-[#DCE5D9] bg-[#FCFBF8] p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38]">
          <Wallet size={19} />
        </span>

        <div>
          <h4 className="text-sm font-semibold text-[#183A2D]">
            Refund information
          </h4>

          <p className="mt-0.5 text-xs text-[#858A80]">
            {order.paymentMethod === "RAZORPAY"
              ? "Refund will be processed to your original payment method."
              : "Your refund will be processed through bank transfer."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-[#E7E4DB] pt-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-[#858A80]">Refund status</p>

          <span
            className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(item.refundStatus)}`}
          >
            {formatStatus(item.refundStatus)}
          </span>
        </div>

        {item.refundAmount > 0 && (
          <div>
            <p className="text-xs text-[#858A80]">Refund amount</p>
            <p className="mt-2 text-sm font-semibold text-[#174B38]">
              ₹{item.refundAmount.toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {item.refundedAt && (
          <div>
            <p className="text-xs text-[#858A80]">Refund date</p>
            <p className="mt-1.5 text-sm font-medium text-[#252923]">
              {formatDate(item.refundedAt)}
            </p>
          </div>
        )}

        {(item.refundReference || item.razorpayRefundId) && (
          <div className="sm:col-span-2">
            <p className="text-xs text-[#858A80]">
              {order.paymentMethod === "RAZORPAY"
                ? "Razorpay refund ID"
                : "Transaction reference"}
            </p>

            <p className="mt-1.5 break-all text-sm font-medium text-[#252923]">
              {item.refundReference || item.razorpayRefundId}
            </p>
          </div>
        )}
      </div>

      {order.paymentMethod === "RAZORPAY" &&
        item.refundStatus === "processing" && (
          <p className="mt-4 rounded-xl bg-[#E8EFF8] p-3 text-xs leading-5 text-[#355C91]">
            Your refund is being processed by Razorpay. It may take some
            time to reflect in your original payment method.
          </p>
        )}

      {item.refundStatus === "refunded" && (
        <p className="mt-4 rounded-xl bg-[#E6F1E6] p-3 text-xs leading-5 text-[#28613D]">
          Your refund has been completed successfully.
        </p>
      )}

      {item.refundStatus === "failed" && (
        <p className="mt-4 rounded-xl bg-[#FCEAEA] p-3 text-xs leading-5 text-[#B34343]">
          Your refund could not be completed. Please contact support.
        </p>
      )}
    </div>
  )}

                  </div>
                ))}
              </div>

              {/* ORDER FOOTER */}
              <div className="flex flex-col justify-between gap-5 border-t border-[#E7E4DB] bg-[#FCFBF8] p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#92978D]">
                      <CreditCard size={12} />
                      PAYMENT STATUS
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(order.paymentStatus)}`}
                    >
                      {formatStatus(order.paymentStatus)}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-[#92978D]">
                      TOTAL AMOUNT
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#174B38]">
                      ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/my-orders/${order._id}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3 text-sm font-semibold text-white! transition hover:-translate-y-0.5 hover:bg-[#103729]"
                >
                  View order details
                  <ChevronRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* BOTTOM SHOPPING CTA */}
        <section className="mt-9 overflow-hidden rounded-3xl bg-[#E7EDE3] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#174B38]">
                <ShoppingBag size={21} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#183A2D]">
                  Looking for something else?
                </h3>
                <p className="mt-1 text-sm text-[#73786F]">
                  Discover more products and find your next favourite.
                </p>
              </div>
            </div>

            <Link
              to="/products"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3 text-sm font-semibold text-white! transition hover:bg-[#103729]"
            >
              Explore products
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default MyOrders;
