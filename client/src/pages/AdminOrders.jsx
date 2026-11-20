
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Package,
  AlertCircle,
  Eye,
  X,
  UserRound,
  MapPin,
  CreditCard,
  RotateCcw,
  Filter,
  ClipboardList,
} from "lucide-react";

import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";

const initialPagination = {
  currentPage: 1,
  totalPages: 1,
  totalOrders: 0,
};

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);

const statusStyles = {
  placed: "bg-blue-50 text-blue-700 ring-blue-200",
  confirmed: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  shipped: "bg-violet-50 text-violet-700 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  refunded: "bg-purple-50 text-purple-700 ring-purple-200",
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = String(status || "").toLowerCase();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ring-inset ${
        statusStyles[normalizedStatus] ||
        "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {normalizedStatus.replaceAll("_", " ") || "N/A"}
    </span>
  );
};

const SectionCard = ({ icon: Icon, title, children }) => (
  <section className="rounded-2xl border border-[#EAE7DE] bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2.5">
      <div className="rounded-xl bg-[#EAF0E9] p-2 text-[#174B38]">
        <Icon size={17} />
      </div>
      <h3 className="text-sm font-bold text-[#183D32]">{title}</h3>
    </div>
    {children}
  </section>
);

const DetailRow = ({ label, value }) => (
  <div className="flex flex-wrap justify-between gap-2 border-b border-[#F0EEE8] py-2.5 last:border-0">
    <span className="text-xs text-[#85877F]">{label}</span>
    <span className="max-w-[65%] wrap-break-wordword text-right text-xs font-semibold text-[#34443B]">
      {value || "N/A"}
    </span>
  </div>
);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(initialPagination);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/orders", {
          params: {
            page,
            limit: 10,
            search: search.trim(),
            status,
            paymentStatus,
          },
        });

        if (ignore) return;

        setOrders(response.data.orders || []);
        setPagination(response.data.pagination || initialPagination);
      } catch (err) {
        if (ignore) return;

        setError(
          err.response?.data?.message || "Failed to load orders."
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [page, search, status, paymentStatus, refreshKey]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPage(1);
  };

  const hasFilters = search || status || paymentStatus;

  const closeModal = () => setSelectedOrder(null);

  return (
    <div className="min-h-screen w-full bg-[#F7F5EF]">
      <div className="grid w-full grid-cols-1 gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-7 lg:px-8 lg:py-7">
        <AdminSidebar />

        <main className="min-w-0">
          {/* Header */}
          <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#8B9188]">
                <span>Admin</span>
                <span>/</span>
                <span className="text-[#174B38]">Orders</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#183D32] sm:text-3xl">
                Orders Management
              </h1>

              <p className="mt-1.5 text-sm text-[#85877F]">
                Manage, monitor and review marketplace orders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#174B38] px-4 py-2.5 text-sm font-semibold text-white! shadow-sm transition hover:bg-[#103D2D] disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {/* Overview */}
          <section className="mb-6 overflow-hidden rounded-3xl bg-[#174B38] p-5 text-white shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-white/65">
                  <ShoppingBag size={17} />
                  Marketplace overview
                </div>

                <p className="text-sm font-medium text-white/75">
                  Total marketplace orders
                </p>

                <h2 className="mt-1 text-4xl font-bold tracking-tight">
                  {pagination.totalOrders ?? 0}
                </h2>

                <p className="mt-2 text-xs text-white/60">
                  Orders matching your current filters
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <ClipboardList size={30} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/15 pt-4 text-xs text-white/70">
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                Page {pagination.currentPage || page}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                {pagination.totalPages || 1} total pages
              </span>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="mb-6 rounded-2xl border border-[#EAE7DE] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[#EAF0E9] p-2 text-[#174B38]">
                  <Filter size={16} />
                </div>
                <h2 className="text-sm font-bold text-[#183D32]">
                  Search & Filters
                </h2>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#174B38] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92968E]"
                />
                <input
                  id="order-search"
                  name="search"
                  type="text"
                  value={search}
                  onChange={(e) =>
                    handleFilterChange(setSearch, e.target.value)
                  }
                  placeholder="Search order or buyer..."
                  className="w-full rounded-xl border border-[#E9E7DF] bg-[#FCFBF8] py-3 pl-10 pr-3 text-sm text-[#34443B] outline-none transition placeholder:text-[#A2A49D] focus:border-[#174B38] focus:ring-2 focus:ring-[#174B38]/10"
                />
              </div>

              <select
                id="order-status"
                name="status"
                value={status}
                onChange={(e) =>
                  handleFilterChange(setStatus, e.target.value)
                }
                className="w-full rounded-xl border border-[#E9E7DF] bg-[#FCFBF8] px-3 py-3 text-sm text-[#34443B] outline-none focus:border-[#174B38] focus:ring-2 focus:ring-[#174B38]/10"
              >
                <option value="">All Order Status</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                id="payment-status"
                name="paymentStatus"
                value={paymentStatus}
                onChange={(e) =>
                  handleFilterChange(setPaymentStatus, e.target.value)
                }
                className="w-full rounded-xl border border-[#E9E7DF] bg-[#FCFBF8] px-3 py-3 text-sm text-[#34443B] outline-none focus:border-[#174B38] focus:ring-2 focus:ring-[#174B38]/10"
              >
                <option value="">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </section>

          {/* Orders Table */}
          <section className="overflow-hidden rounded-2xl border border-[#EAE7DE] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEEE8] px-5 py-4">
              <div>
                <h2 className="font-bold text-[#183D32]">
                  All Orders
                </h2>
                <p className="mt-1 text-xs text-[#92968E]">
                  Review buyer, products and payment details
                </p>
              </div>

              <span className="rounded-full bg-[#EAF0E9] px-3 py-1.5 text-xs font-bold text-[#174B38]">
                {orders.length} displayed
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCE7DE] border-t-[#174B38]" />
                <p className="text-sm text-[#85877F]">
                  Loading orders...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
                <div className="rounded-2xl bg-red-50 p-4 text-red-500">
                  <AlertCircle size={28} />
                </div>
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => setRefreshKey((prev) => prev + 1)}
                  className="rounded-xl bg-[#174B38] px-5 py-2.5 text-sm font-semibold text-white!"
                >
                  Try Again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="mb-4 rounded-2xl bg-[#F1F3ED] p-5 text-[#829083]">
                  <Package size={32} />
                </div>
                <h3 className="font-bold text-[#34443B]">
                  No orders found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-[#92968E]">
                  No orders match your current search or filters.
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-sm font-bold text-[#174B38] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-262.5 text-left">
                    <thead className="bg-[#F8F7F2]">
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-[#92968E]">
                        <th className="px-5 py-4">Order</th>
                        <th className="px-5 py-4">Buyer</th>
                        <th className="px-5 py-4">Products</th>
                        <th className="px-5 py-4">Amount</th>
                        <th className="px-5 py-4">Payment</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#F0EEE8]">
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="transition hover:bg-[#FCFBF8]"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-[#174B38]">
                              #{order._id?.slice(-8).toUpperCase()}
                            </p>
                            <p className="mt-1 text-[11px] text-[#92968E]">
                              {order.items?.length || 0} item(s)
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#34443B]">
                              {order.buyerId?.name || "Unknown"}
                            </p>
                            <p className="mt-1 max-w-40 truncate text-xs text-[#92968E]">
                              {order.buyerId?.email || "N/A"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="max-w-47.5 space-y-2">
                              {order.items?.slice(0, 2).map((item) => (
                                <div key={item._id || item.productId}>
                                  <p className="truncate text-sm font-medium text-[#46534A]">
                                    {item.productName || "Product"}
                                  </p>
                                  <p className="text-[11px] text-[#92968E]">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              ))}

                              {order.items?.length > 2 && (
                                <p className="text-xs font-semibold text-[#174B38]">
                                  +{order.items.length - 2} more items
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-[#183D32]">
                              {formatAmount(order.totalAmount)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="mb-1.5 text-xs font-semibold text-[#46534A]">
                              {order.paymentMethod || "N/A"}
                            </p>
                            <StatusBadge status={order.paymentStatus} />
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={order.status} />
                          </td>

                          <td className="px-5 py-4 text-xs font-medium text-[#777F76]">
                            {formatDate(order.createdAt)}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#EAF0E9] px-3 py-2 text-xs font-bold text-[#174B38] transition hover:bg-[#DDE9DF]"
                            >
                              <Eye size={15} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFEEE8] px-5 py-4">
                  <p className="text-xs text-[#85877F]">
                    Page{" "}
                    <span className="font-bold text-[#34443B]">
                      {pagination.currentPage || page}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-[#34443B]">
                      {pagination.totalPages || 1}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((prev) => prev - 1)}
                      className="rounded-xl border border-[#E8E6DE] p-2.5 text-[#46534A] transition hover:bg-[#F5F4EE] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <button
                      type="button"
                      disabled={
                        page >= (pagination.totalPages || 1) || loading
                      }
                      onClick={() => setPage((prev) => prev + 1)}
                      className="rounded-xl border border-[#E8E6DE] p-2.5 text-[#46534A] transition hover:bg-[#F5F4EE] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10251D]/55 p-3 backdrop-blur-sm sm:p-5"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-[#F7F5EF] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EAE7DE] bg-white px-5 py-4 sm:px-7">
              <div>
                <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#92968E]">
                  <ShoppingBag size={13} />
                  Marketplace order
                </div>
                <h2
                  id="order-details-title"
                  className="text-lg font-bold text-[#183D32]"
                >
                  Order Details
                </h2>
                <p className="mt-1 text-xs text-[#85877F]">
                  #{selectedOrder._id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close order details"
                className="rounded-xl bg-[#F3F3EE] p-2.5 text-[#69736A] transition hover:bg-[#E8EBE3]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              {/* Order Summary */}
              <div className="rounded-2xl bg-[#174B38] p-5 text-white">
                <p className="text-xs font-medium text-white/65">
                  Order total
                </p>

                <h3 className="mt-1 text-3xl font-bold">
                  {formatAmount(selectedOrder.totalAmount)}
                </h3>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedOrder.status} />
                  <StatusBadge status={selectedOrder.paymentStatus} />
                </div>
              </div>

              {/* Buyer Information */}
              <SectionCard icon={UserRound} title="Buyer Information">
                <DetailRow
                  label="Full Name"
                  value={selectedOrder.buyerId?.name}
                />
                <DetailRow
                  label="Email Address"
                  value={selectedOrder.buyerId?.email}
                />
              </SectionCard>

              {/* Shipping Address */}
              <SectionCard icon={MapPin} title="Shipping Address">
                <DetailRow
                  label="Recipient"
                  value={selectedOrder.shippingAddress?.fullName}
                />
                <DetailRow
                  label="Phone"
                  value={selectedOrder.shippingAddress?.phone}
                />
                <DetailRow
                  label="Address"
                  value={selectedOrder.shippingAddress?.addressLine}
                />
                <DetailRow
                  label="City"
                  value={selectedOrder.shippingAddress?.city}
                />
                <DetailRow
                  label="State"
                  value={selectedOrder.shippingAddress?.state}
                />
                <DetailRow
                  label="Pincode"
                  value={selectedOrder.shippingAddress?.pincode}
                />
              </SectionCard>

              {/* Payment Information */}
              <SectionCard icon={CreditCard} title="Payment Information">
                <DetailRow
                  label="Payment Method"
                  value={selectedOrder.paymentMethod}
                />
                <DetailRow
                  label="Payment Status"
                  value={selectedOrder.paymentStatus}
                />
                <DetailRow
                  label="Order Date"
                  value={formatDate(selectedOrder.createdAt)}
                />
                <DetailRow
                  label="Order ID"
                  value={selectedOrder._id}
                />
                <DetailRow
                  label="Total Amount"
                  value={formatAmount(selectedOrder.totalAmount)}
                />
              </SectionCard>

              {/* Ordered Products */}
              <SectionCard icon={Package} title="Ordered Products">
                <div className="space-y-4">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item._id || item.productId}
                      className="rounded-xl border border-[#EFEEE8] bg-[#FCFBF8] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-bold text-[#34443B]">
                            {item.productName || "Product"}
                          </h4>

                          <p className="mt-1 text-xs text-[#85877F]">
                            Quantity: {item.quantity}
                          </p>

                          <p className="mt-1 text-xs text-[#85877F]">
                            Seller: {item.storeId?.storeName || "N/A"}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-[#174B38]">
                          {formatAmount(
                            item.price * item.quantity
                          )}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#EFEEE8] pt-3">
                        <span className="text-[11px] text-[#85877F]">
                          Item status:
                        </span>
                        <StatusBadge status={item.status} />
                      </div>

                      {/* Return & Refund */}
                      <div className="mt-3 rounded-xl bg-[#F0F1EB] p-3">
                        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#174B38]">
                          <RotateCcw size={14} />
                          Return & Refund
                        </div>

                        <div className="space-y-2 text-xs text-[#69736A]">
                          <DetailRow
                            label="Return Status"
                            value={item.returnStatus?.replaceAll("_", " ")}
                          />

                          {item.returnReason && (
                            <DetailRow
                              label="Return Reason"
                              value={item.returnReason.replaceAll("_", " ")}
                            />
                          )}

                          {item.returnDescription && (
                            <DetailRow
                              label="Description"
                              value={item.returnDescription}
                            />
                          )}

                          <DetailRow
                            label="Refund Status"
                            value={item.refundStatus?.replaceAll("_", " ")}
                          />

                          <DetailRow
                            label="Refund Amount"
                            value={formatAmount(item.refundAmount)}
                          />

                          {item.refundReference && (
                            <DetailRow
                              label="Refund Reference"
                              value={item.refundReference}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!selectedOrder.items ||
                    selectedOrder.items.length === 0) && (
                    <p className="py-5 text-center text-sm text-[#85877F]">
                      No product details available.
                    </p>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex justify-end border-t border-[#EAE7DE] bg-white px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-[#174B38] px-6 py-2.5 text-sm font-bold text-white! transition hover:bg-[#103D2D]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
