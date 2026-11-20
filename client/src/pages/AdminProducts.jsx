
import { useEffect, useState } from "react";
import {
  Search,
  Package,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Power,
  Trash2,
  AlertCircle,
  Filter,
  Boxes,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Store,
  Tag,
} from "lucide-react";

import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";

const initialPagination = {
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
};

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);

const ProductStatus = ({ status }) => {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ring-1 ring-inset ${
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      {isActive ? (
        <CheckCircle2 size={12} />
      ) : (
        <XCircle size={12} />
      )}
      {status || "inactive"}
    </span>
  );
};

const StockBadge = ({ stock }) => {
  const quantity = Number(stock) || 0;

  const stockStyle =
    quantity === 0
      ? "bg-red-50 text-red-700"
      : quantity <= 5
        ? "bg-amber-50 text-amber-700"
        : "bg-[#EAF0E9] text-[#174B38]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ${stockStyle}`}
    >
      {quantity <= 5 && <AlertTriangle size={12} />}
      {quantity} units
    </span>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState(initialPagination);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/products", {
          params: {
            page,
            limit: 10,
            search,
            status,
          },
        });

        if (ignore) return;

        setProducts(response.data.products || []);
        setPagination(
          response.data.pagination || initialPagination
        );
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "Failed to load products."
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [page, search, status, refreshKey]);

  const handleStatusChange = async (product) => {
    const newStatus =
      product.status === "active" ? "inactive" : "active";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus === "active" ? "activate" : "deactivate"
      } this product?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(product._id);

      await api.patch(
        `/admin/products/${product._id}/status`,
        { status: newStatus }
      );

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
          "Failed to update product status."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setActionLoading(productId);

      await api.delete(`/admin/products/${productId}`);

      if (products.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
          "Failed to delete product."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatus(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const hasFilters = search || status !== "all";

  const activeCount = products.filter(
    (product) => product.status === "active"
  ).length;

  const inactiveCount = products.filter(
    (product) => product.status !== "active"
  ).length;

  const lowStockCount = products.filter(
    (product) => Number(product.stock) <= 5
  ).length;

  return (
    <div className="min-h-screen w-full bg-[#F7F5EF]">
      <div className="grid w-full grid-cols-1 gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-7 lg:px-8 lg:py-7">
        <AdminSidebar />

        <main className="min-w-0">
          {/* Header */}
          <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#92968E]">
                <span>Admin</span>
                <span>/</span>
                <span className="text-[#174B38]">Products</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#183D32] sm:text-3xl">
                Products Management
              </h1>

              <p className="mt-1.5 text-sm text-[#85877F]">
                Manage your marketplace inventory and product listings.
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

          {/* Inventory Overview */}
          <section className="mb-6 overflow-hidden rounded-3xl bg-[#174B38] p-5 text-white shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-white/65">
                  <Boxes size={17} />
                  Inventory overview
                </div>

                <p className="text-sm font-medium text-white/75">
                  Total marketplace products
                </p>

                <h2 className="mt-1 text-4xl font-bold tracking-tight">
                  {pagination.totalProducts ?? 0}
                </h2>

                <p className="mt-2 text-xs text-white/60">
                  Across all marketplace listings
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <Package size={30} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/15 pt-5">
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[11px] text-white/65">
                  <CheckCircle2 size={13} />
                  Active
                </div>
                <p className="text-xl font-bold">{activeCount}</p>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[11px] text-white/65">
                  <XCircle size={13} />
                  Inactive
                </div>
                <p className="text-xl font-bold">{inactiveCount}</p>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[11px] text-white/65">
                  <AlertTriangle size={13} />
                  Low stock
                </div>
                <p className="text-xl font-bold">{lowStockCount}</p>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-white/50">
              Status and stock counts above reflect the currently loaded page.
            </p>
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
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92968E]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    handleSearchChange(e.target.value)
                  }
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-[#E9E7DF] bg-[#FCFBF8] py-3 pl-10 pr-4 text-sm text-[#34443B] outline-none transition placeholder:text-[#A2A49D] focus:border-[#174B38] focus:ring-2 focus:ring-[#174B38]/10"
                />
              </div>

              <select
                value={status}
                onChange={(e) =>
                  handleStatusFilter(e.target.value)
                }
                className="w-full rounded-xl border border-[#E9E7DF] bg-[#FCFBF8] px-3 py-3 text-sm text-[#34443B] outline-none focus:border-[#174B38] focus:ring-2 focus:ring-[#174B38]/10"
              >
                <option value="all">All Products</option>
                <option value="active">Active Products</option>
                <option value="inactive">Inactive Products</option>
              </select>
            </div>
          </section>

          {/* Products Table */}
          <section className="overflow-hidden rounded-2xl border border-[#EAE7DE] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEEE8] px-5 py-4">
              <div>
                <h2 className="font-bold text-[#183D32]">
                  All Products
                </h2>
                <p className="mt-1 text-xs text-[#92968E]">
                  Review and manage marketplace listings
                </p>
              </div>

              <span className="rounded-full bg-[#EAF0E9] px-3 py-1.5 text-xs font-bold text-[#174B38]">
                {products.length} displayed
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCE7DE] border-t-[#174B38]" />
                <p className="text-sm text-[#85877F]">
                  Loading products...
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
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="mb-4 rounded-2xl bg-[#F1F3ED] p-5 text-[#829083]">
                  <Package size={32} />
                </div>

                <h3 className="font-bold text-[#34443B]">
                  No products found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-[#92968E]">
                  No products match your current search or filters.
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
                  <table className="w-full min-w-225 text-left">
                    <thead className="bg-[#F8F7F2]">
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-[#92968E]">
                        <th className="px-5 py-4">Product</th>
                        <th className="px-5 py-4">Seller Store</th>
                        <th className="px-5 py-4">Price</th>
                        <th className="px-5 py-4">Inventory</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#F0EEE8]">
                      {products.map((product) => {
                        const isActionLoading =
                          actionLoading === product._id;

                        return (
                          <tr
                            key={product._id}
                            className="transition hover:bg-[#FCFBF8]"
                          >
                            {/* Product */}
                            <td className="px-5 py-4">
                              <div className="flex min-w-55 items-center gap-3">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name || "Product"}
                                    loading="lazy"
                                    className="h-14 w-14 shrink-0 rounded-xl border border-[#EEECE5] bg-[#F7F5EF] object-cover"
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F0EEE6] text-[#829083]">
                                    <Package size={22} />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="max-w-50 truncate text-sm font-bold text-[#34443B]">
                                    {product.name || "Untitled Product"}
                                  </p>

                                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[#92968E]">
                                    <Tag size={12} />
                                    {product.category || "Uncategorized"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Seller */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="rounded-lg bg-[#F0F1EB] p-2 text-[#64796A]">
                                  <Store size={15} />
                                </div>

                                <span className="max-w-37.5 truncate text-sm font-medium text-[#536057]">
                                  {product.storeId?.storeName ||
                                    "Unknown Store"}
                                </span>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-5 py-4">
                              <p className="text-sm font-bold text-[#183D32]">
                                {formatAmount(product.price)}
                              </p>
                            </td>

                            {/* Stock */}
                            <td className="px-5 py-4">
                              <StockBadge stock={product.stock} />
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <ProductStatus status={product.status} />
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() =>
                                    handleStatusChange(product)
                                  }
                                  title={
                                    product.status === "active"
                                      ? "Deactivate product"
                                      : "Activate product"
                                  }
                                  className={`rounded-xl border p-2.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                    product.status === "active"
                                      ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  }`}
                                >
                                  {isActionLoading ? (
                                    <RefreshCw
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Power size={16} />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() =>
                                    handleDelete(product._id)
                                  }
                                  title="Delete product"
                                  className="rounded-xl border border-red-200 p-2.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFEEE8] px-5 py-4">
                  <p className="text-xs text-[#85877F]">
                    Total{" "}
                    <span className="font-bold text-[#34443B]">
                      {pagination.totalProducts}
                    </span>{" "}
                    products
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={page <= 1 || loading}
                      onClick={() =>
                        setPage((prev) => prev - 1)
                      }
                      aria-label="Previous page"
                      className="rounded-xl border border-[#E8E6DE] p-2.5 text-[#46534A] transition hover:bg-[#F5F4EE] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <span className="text-xs font-bold text-[#34443B]">
                      {pagination.currentPage || page} /{" "}
                      {pagination.totalPages || 1}
                    </span>

                    <button
                      type="button"
                      disabled={
                        page >= (pagination.totalPages || 1) ||
                        loading
                      }
                      onClick={() =>
                        setPage((prev) => prev + 1)
                      }
                      aria-label="Next page"
                      className="rounded-xl border border-[#E8E6DE] p-2.5 text-[#46534A] transition hover:bg-[#F5F4EE] disabled:cursor-not-allowed disabled:opacity-40"
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
    </div>
  );
};

export default AdminProducts;
