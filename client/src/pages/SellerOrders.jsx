import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Package,
  RefreshCw,
  MapPin,
  Image as ImageIcon,
  Search,
  Filter,
  ShoppingBag,
  IndianRupee,
  Clock3,
  Truck,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import api from "../services/api";

const NEXT_STATUSES = {
  placed: [{ value: "confirmed", label: "Confirm order" }],
  confirmed: [{ value: "shipped", label: "Mark shipped" }],
  shipped: [{ value: "delivered", label: "Mark delivered" }],
  delivered: [],
  cancelled: [],
  canceled: [],
};

const STATUS_STYLES = {
  placed: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-[#E4EBE3] text-[#174B38] ring-[#D6E1D5]",
  shipped: "bg-violet-50 text-violet-800 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  canceled: "bg-red-50 text-red-700 ring-red-200",
};

const PAYMENT_STYLES = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

const FILTERS = [
  { label: "All orders", value: "all" },
  { label: "Placed", value: "placed" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const SELECT_CLASS =
  "w-full min-w-0 rounded-xl border border-[#E7E4DB] bg-white px-3 py-2.5 text-sm font-medium text-[#174B38] outline-none transition focus:border-[#174B38] focus:ring-2 focus:ring-[#174B38]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState("");
  const [collectingItem, setCollectingItem] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/orders/seller/my-orders");
      setOrders(response.data?.orders || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load seller orders."));
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const getOrders = async () => {
      try {
        const response = await api.get("/orders/seller/my-orders");

        if (isActive) {
          setOrders(response.data?.orders || []);
          setError("");
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            getErrorMessage(requestError, "Unable to load seller orders."),
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    getOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const getStatus = (value) =>
    String(value || "placed")
      .trim()
      .toLowerCase();

  const allItems = useMemo(
    () => orders.flatMap((order) => order.items || []),
    [orders],
  );

  const stats = useMemo(() => {
    const pending = allItems.filter(
      (item) => getStatus(item.status) === "placed",
    ).length;

    const shipped = allItems.filter(
      (item) => getStatus(item.status) === "shipped",
    ).length;

    const delivered = allItems.filter(
      (item) => getStatus(item.status) === "delivered",
    ).length;

    const sales = orders.reduce(
      (total, order) => total + (Number(order.sellerTotal) || 0),
      0,
    );

    return {
      total: orders.length,
      pending,
      shipped,
      delivered,
      sales,
    };
  }, [orders, allItems]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const items = order.items || [];

      const matchesSearch =
        !query ||
        String(order._id || "")
          .toLowerCase()
          .includes(query) ||
        items.some((item) =>
          String(item.productName || "")
            .toLowerCase()
            .includes(query),
        );

      const matchesFilter =
        activeFilter === "all" ||
        items.some((item) => {
          const status = getStatus(item.status);

          if (activeFilter === "cancelled") {
            return status === "cancelled" || status === "canceled";
          }

          return status === activeFilter;
        });

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, activeFilter]);

  const updateStatus = async (orderId, itemId, nextStatus) => {
    const allowedStatuses = ["confirmed", "shipped", "delivered"];

    if (!allowedStatuses.includes(nextStatus)) {
      setError("Invalid status. Please select a valid order status.");
      return;
    }

    const key = `${orderId}-${itemId}`;

    try {
      setUpdatingItem(key);
      setError("");

      await api.patch(`/orders/seller/${orderId}/items/${itemId}/status`, {
        status: nextStatus,
      });

      await fetchOrders();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update order status."));
    } finally {
      setUpdatingItem("");
    }
  };

  const handleCollectPayment = async (orderId, itemId) => {
    const confirmed = window.confirm(
      "Have you received the COD payment for this item?",
    );

    if (!confirmed) return;

    const key = `${orderId}-${itemId}`;

    try {
      setCollectingItem(key);
      setError("");

      await api.patch(`/orders/seller/${orderId}/items/${itemId}/payment`);

      await fetchOrders();

      window.alert("Payment marked as collected successfully!");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to update payment status."),
      );
    } finally {
      setCollectingItem("");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#E4EBE3]">
            <RefreshCw size={24} className="animate-spin text-[#174B38]" />
          </div>
          <p className="text-sm font-medium text-[#73786F]">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] px-4 py-7 text-[#252923] sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D6E1D5] bg-[#E4EBE3] px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-[#174B38]">
                <ClipboardList size={13} />
                SELLER WORKSPACE
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#252923] sm:text-4xl">
                Orders
                <span className="text-[#174B38]">.</span>
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#73786F]">
                Track incoming orders, manage fulfilment and collect COD
                payments from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E4E1D8] bg-white px-4 py-3 text-sm font-semibold text-[#39463C] shadow-sm transition hover:border-[#174B38]/30 hover:bg-[#F3F5F0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh orders"}
            </button>
          </div>
        </motion.section>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 font-semibold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Overview Cards */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#252923]">Order overview</h2>
            <p className="mt-1 text-xs text-[#85877F]">
              Your store's order activity at a glance
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: "Total orders",
                value: stats.total,
                icon: ShoppingBag,
                color: "bg-[#E4EBE3] text-[#174B38]",
              },
              {
                label: "Awaiting action",
                value: stats.pending,
                icon: Clock3,
                color: "bg-[#F5EBDD] text-[#986B35]",
              },
              {
                label: "Shipped items",
                value: stats.shipped,
                icon: Truck,
                color: "bg-[#EEEAF7] text-[#6C5B99]",
              },
              {
                label: "Delivered items",
                value: stats.delivered,
                icon: CheckCircle2,
                color: "bg-[#E5F1E9] text-[#31734A]",
              },
            ].map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.article
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="rounded-2xl border border-[#E7E4DB] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex size-10 items-center justify-center rounded-xl ${card.color}`}
                    >
                      <Icon size={19} />
                    </span>
                    <span className="text-[10px] font-bold tracking-wider text-[#A0A196]">
                      OVERALL
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-medium text-[#73786F] sm:text-sm">
                    {card.label}
                  </p>

                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#252923] sm:text-3xl">
                    {card.value.toLocaleString("en-IN")}
                  </h3>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* Revenue and Orders Summary */}
        <section className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-3xl bg-[#123D2E] p-6 text-white sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-4 -top-16 size-48 rounded-full border border-white/10" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D1E0CB]">
                <IndianRupee size={16} />
                TOTAL SELLER ORDER VALUE
              </div>

              <h2 className="mt-4 wrap-break-word text-4xl font-bold tracking-tight sm:text-5xl">
                {`₹${stats.sales.toLocaleString("en-IN")}`}
              </h2>

              <p className="mt-3 text-xs leading-5 text-white/60">
                Combined sellerTotal value from the orders currently loaded.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-[#DDE5D8] bg-[#EAF0E7] p-6 sm:p-7">
            <div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-white text-[#174B38]">
                <Package size={21} />
              </span>

              <h3 className="mt-5 text-lg font-bold text-[#193C2E]">
                Keep orders moving
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#647467]">
                Confirm new orders, update shipping progress and mark deliveries
                when completed.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#174B38]">
              <span className="size-2 rounded-full bg-[#4F9369]" />
              Order management workspace
            </div>
          </div>
        </section>

        {/* Orders Toolbar */}
        <section className="overflow-hidden rounded-3xl border border-[#E7E4DB] bg-white shadow-sm">
          <div className="border-b border-[#EEECE5] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-[#252923]">All orders</h2>
                <p className="mt-1 text-xs text-[#85877F]">
                  {filteredOrders.length} of {orders.length} orders displayed
                </p>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92958C]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order ID or product..."
                  className="w-full rounded-xl border border-[#E7E4DB] bg-[#FBFAF6] py-3 pl-10 pr-4 text-sm text-[#252923] outline-none transition placeholder:text-[#A0A196] focus:border-[#174B38] focus:bg-white focus:ring-2 focus:ring-[#174B38]/10"
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
              <Filter size={16} className="mr-1 shrink-0 text-[#85877F]" />

              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    activeFilter === filter.value
                      ? "bg-[#174B38] text-white shadow-sm"
                      : "border border-[#E7E4DB] bg-[#FBFAF6] text-[#73786F] hover:border-[#174B38]/30 hover:text-[#174B38]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-16 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#E4EBE3] text-[#174B38]">
                {orders.length === 0 ? (
                  <Package size={30} />
                ) : (
                  <Search size={28} />
                )}
              </div>

              <h3 className="text-lg font-bold text-[#252923]">
                {orders.length === 0 ? "No orders yet" : "No matching orders"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#73786F]">
                {orders.length === 0
                  ? "Orders placed for your store will appear here."
                  : "Try another search term or choose a different status filter."}
              </p>

              {(search || activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("all");
                  }}
                  className="mt-5 text-sm font-semibold text-[#174B38] underline underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#EEECE5]">
              {filteredOrders.map((order, index) => (
                <motion.article
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.035 }}
                >
                  {/* Order Header */}
                  <div className="flex flex-col justify-between gap-4 bg-[#FBFAF6] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-[#E4EBE3] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#174B38]">
                          ORDER
                        </span>
                        <span className="text-xs text-[#85877F]">
                          {order.createdAt
                            ? formatDate(order.createdAt)
                            : "Date unavailable"}
                        </span>
                      </div>

                      <h3 className="mt-2 break-all text-sm font-bold text-[#252923] sm:text-base">
                        #{order._id}
                      </h3>

                      <p className="mt-1 text-xs text-[#85877F]">
                        {(order.items || []).length}{" "}
                        {(order.items || []).length === 1 ? "item" : "items"}
                        {" · "}
                        {order.paymentMethod || "Unknown payment method"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="sm:text-right">
                        <p className="text-[10px] font-bold tracking-wider text-[#85877F]">
                          SELLER ORDER VALUE
                        </p>
                        <p className="mt-1 text-xl font-bold text-[#174B38]">
                          {formatPrice(order.sellerTotal)}
                        </p>
                      </div>

                      <div className="flex size-10 items-center justify-center rounded-xl border border-[#E7E4DB] bg-white text-[#174B38]">
                        <ShoppingBag size={19} />
                      </div>
                    </div>
                  </div>

                  {/* Order Metadata */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-[#EEECE5] px-5 py-3 text-xs text-[#73786F] sm:px-6">
                    <span>
                      Payment:{" "}
                      <strong className="font-semibold capitalize text-[#42483F]">
                        {order.paymentStatus || "Unknown"}
                      </strong>
                    </span>

                    <span>
                      Method:{" "}
                      <strong className="font-semibold text-[#42483F]">
                        {order.paymentMethod || "Unknown"}
                      </strong>
                    </span>

                    {order.shippingAddress && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#174B38]" />
                        Shipping address available
                      </span>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-[#EEECE5] px-5 sm:px-6">
                    {(order.items || []).map((item) => {
                      const itemId = item._id;
                      const key = `${order._id}-${itemId}`;

                      const status = getStatus(item.status);
                      const paymentStatus = getStatus(
                        item.paymentStatus || "pending",
                      );

                      const paymentMethod = String(order.paymentMethod || "")
                        .trim()
                        .toUpperCase();

                      const options = NEXT_STATUSES[status] || [];

                      const canCollectPayment =
                        paymentMethod === "COD" &&
                        status === "delivered" &&
                        paymentStatus !== "paid";

                      return (
                        <div
                          key={itemId || item.productId || item.productName}
                          className="flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between"
                        >
                          {/* Product Information */}
                          <div className="flex min-w-0 flex-1 items-start gap-4">
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E7E4DB] bg-[#F7F5EF] sm:size-24">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName || "Product"}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                    event.currentTarget.parentElement.classList.add(
                                      "flex",
                                      "items-center",
                                      "justify-center",
                                    );
                                  }}
                                />
                              ) : (
                                <ImageIcon
                                  size={27}
                                  className="text-[#A0A196]"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="wrap-break-word font-semibold text-[#252923]">
                                {item.productName || "Product"}
                              </h4>

                              <p className="mt-1 text-xs text-[#85877F] sm:text-sm">
                                {formatPrice(item.price)} × {item.quantity}
                              </p>

                              <p className="mt-2 text-sm font-bold text-[#252923]">
                                {formatPrice(
                                  Number(item.price) * Number(item.quantity),
                                )}
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${
                                    STATUS_STYLES[status] ||
                                    "bg-[#F1F0E9] text-[#42483F] ring-[#E7E4DB]"
                                  }`}
                                >
                                  {status}
                                </span>

                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${
                                    PAYMENT_STYLES[paymentStatus] ||
                                    "bg-[#F1F0E9] text-[#42483F] ring-[#E7E4DB]"
                                  }`}
                                >
                                  Payment: {paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Item Actions */}
                          <div className="flex w-full flex-col gap-3 border-t border-[#EEECE5] pt-4 lg:w-60 lg:shrink-0 lg:border-0 lg:pt-0">
                            {options.length > 0 ? (
                              <label className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold tracking-wider text-[#85877F]">
                                  UPDATE DELIVERY STATUS
                                </span>

                                <select
                                  id={`status-${order._id}-${itemId}`}
                                  name={`status-${order._id}-${itemId}`}
                                  aria-label={`Update status for ${item.productName || "product"}`}
                                  value=""
                                  disabled={updatingItem === key}
                                  onChange={(event) => {
                                    const nextStatus = event.target.value;

                                    if (nextStatus) {
                                      updateStatus(
                                        order._id,
                                        itemId,
                                        nextStatus,
                                      );
                                    }
                                  }}
                                  className={SELECT_CLASS}
                                >
                                  <option value="">
                                    {updatingItem === key
                                      ? "Updating..."
                                      : "Choose next status"}
                                  </option>

                                  {options.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : (
                              <div className="rounded-xl bg-[#F7F5EF] px-3 py-3 text-xs font-medium capitalize text-[#73786F]">
                                {status === "delivered"
                                  ? "Order completed"
                                  : status === "cancelled" ||
                                      status === "canceled"
                                    ? "Item cancelled"
                                    : "No status actions available"}
                              </div>
                            )}

                            {canCollectPayment && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCollectPayment(order._id, itemId)
                                }
                                disabled={collectingItem === key}
                                className="w-full rounded-xl bg-[#174B38] px-4 py-3 text-xs font-bold text-white! transition hover:bg-[#103729] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {collectingItem === key
                                  ? "Updating payment..."
                                  : "Mark COD payment collected"}
                              </button>
                            )}

                            {paymentMethod === "COD" &&
                              status === "delivered" &&
                              paymentStatus === "paid" && (
                                <div className="flex items-center gap-2 rounded-xl bg-[#EAF0E7] px-3 py-3 text-xs font-semibold text-[#174B38]">
                                  <CheckCircle2 size={15} />
                                  Payment collected
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEECE5] bg-[#FBFAF6] px-5 py-3.5 text-xs text-[#73786F] sm:px-6">
                    <span>
                      Order total:{" "}
                      <strong className="font-bold text-[#252923]">
                        {formatPrice(order.sellerTotal)}
                      </strong>
                    </span>

                    <span className="inline-flex items-center gap-1.5 font-medium">
                      Seller order details
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default SellerOrders;
