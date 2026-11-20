
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Store,
  Plus,
  ClipboardList,
  LayoutDashboard,
  CircleHelp,
} from "lucide-react";
import api from "../services/api";

const dashboardCards = [
  {
    title: "Total products",
    key: "products",
    description: "Products listed in your store",
    icon: Package,
    iconBg: "bg-[#E7EFE5]",
    iconColor: "text-[#174B38]",
  },
  {
    title: "Total orders",
    key: "orders",
    description: "Orders received by your store",
    icon: ShoppingBag,
    iconBg: "bg-[#F5EBDD]",
    iconColor: "text-[#986B35]",
  },
];

function SellerDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    sales: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        setError("");

        const [productsResponse, ordersResponse] = await Promise.all([
          api.get("/products/my-products"),
          api.get("/orders/seller/my-orders"),
        ]);

        if (!isActive) return;

        const products = productsResponse.data?.products || [];
        const orders = ordersResponse.data?.orders || [];

        const sales = orders.reduce(
          (total, order) => total + (Number(order.sellerTotal) || 0),
          0
        );

        setStats({
          products: productsResponse.data?.count ?? products.length,
          orders: ordersResponse.data?.count ?? orders.length,
          sales,
        });
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load dashboard statistics."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#E4EBE3]">
            <RefreshCw
              size={24}
              className="animate-spin text-[#174B38]"
            />
          </div>
          <p className="text-sm font-medium text-[#73786F]">
            Loading your store dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[#E7E4DB] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <RefreshCw size={24} />
          </div>

          <h1 className="text-xl font-bold text-[#252923]">
            Dashboard unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#73786F]">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174B38] px-6 py-3 text-sm font-semibold text-white! transition hover:bg-[#103729]"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Dashboard Top Bar */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#174B38] text-white">
              <Store size={21} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#252923]">
                Seller workspace
              </p>
              <p className="text-xs text-[#85877F]">
                Manage your marketplace business
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/seller/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E4E1D8] bg-white px-4 py-2.5 text-xs font-semibold text-[#39463C] transition hover:border-[#174B38]/30 hover:bg-[#F3F5F0] sm:text-sm"
            >
              <ClipboardList size={16} />
              Orders
            </Link>

            <Link
              to="/seller/products"
              className="inline-flex items-center gap-2 rounded-xl bg-[#174B38] px-4 py-2.5 text-xs font-semibold text-white! shadow-sm transition hover:bg-[#103729] sm:text-sm"
            >
              <Plus size={16} />
              Products
            </Link>
          </div>
        </div>

        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DDE5D8] bg-[#EAF0E7] px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-[#174B38]">
              <LayoutDashboard size={13} />
              STORE OVERVIEW
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#252923] sm:text-4xl">
              Good to see you
              <span className="text-[#174B38]">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#73786F]">
              Here's what's happening with your store. Keep track of your
              products, orders and sales in one place.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#73786F]">
            <span className="size-2 rounded-full bg-[#4F9369]" />
            Dashboard overview
          </div>
        </motion.section>

        {/* Main Revenue Panel */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="relative mb-6 overflow-hidden rounded-3xl bg-[#123D2E] p-6 text-white shadow-lg shadow-[#123D2E]/10 sm:p-8 lg:p-9"
        >
          <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-16 size-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 size-64 rounded-full bg-[#A9C6A0]/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D1E0CB]">
                <IndianRupee size={16} />
                TOTAL SELLER SALES
              </div>

              <h2 className="mt-4 wrap-break-word text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {formatCurrency(stats.sales)}
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
                Total value calculated from your seller orders.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <div className="min-w-48 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/65">
                    Total orders
                  </span>
                  <ShoppingBag size={17} className="text-[#C8DDBE]" />
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {formatNumber(stats.orders)}
                </p>
              </div>

              <div className="min-w-48 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/65">
                    Total products
                  </span>
                  <Package size={17} className="text-[#C8DDBE]" />
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {formatNumber(stats.products)}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Performance Cards */}
        <section className="mb-9">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#252923]">
                Store performance
              </h2>
              <p className="mt-1 text-xs text-[#85877F]">
                A quick look at your store metrics
              </p>
            </div>

            <span className="rounded-lg border border-[#E7E4DB] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#73786F]">
              ALL TIME
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dashboardCards.map((card, index) => {
              const Icon = card.icon;
              const value = stats[card.key];

              return (
                <motion.article
                  key={card.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="group rounded-2xl border border-[#E7E4DB] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#174B38]/25 hover:shadow-lg hover:shadow-[#123D2E]/5 sm:p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#73786F]">
                        {card.title}
                      </p>

                      <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#252923]">
                        {formatNumber(value)}
                      </h3>
                    </div>

                    <div className={`flex size-12 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}>
                      <Icon size={23} strokeWidth={1.8} />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#F0EEE8] pt-4">
                    <p className="text-xs text-[#85877F]">
                      {card.description}
                    </p>

                    <Link
                      to="/seller/products"
                      aria-label={`View ${card.title}`}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F0] text-[#174B38] transition group-hover:bg-[#174B38] group-hover:text-white"
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* Workspace Management */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#252923]">
              Manage your store
            </h2>
            <p className="mt-1 text-xs text-[#85877F]">
              Your essential store management tools
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              to="/seller/products"
              className="group flex items-center gap-4 rounded-2xl border border-[#E7E4DB] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#174B38]/30 hover:shadow-lg hover:shadow-[#123D2E]/5 sm:p-6"
            >
              <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-[#E4EBE3] text-[#174B38] transition group-hover:bg-[#174B38] group-hover:text-white">
                <Package size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[#252923]">
                  Product management
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#85877F]">
                  Manage your listings and product information.
                </p>
              </div>

              <ArrowRight
                size={19}
                className="shrink-0 text-[#85877F] transition group-hover:translate-x-1 group-hover:text-[#174B38]"
              />
            </Link>

            <Link
              to="/seller/orders"
              className="group flex items-center gap-4 rounded-2xl border border-[#E7E4DB] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#174B38]/30 hover:shadow-lg hover:shadow-[#123D2E]/5 sm:p-6"
            >
              <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#986B35] transition group-hover:bg-[#174B38] group-hover:text-white">
                <ClipboardList size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[#252923]">
                  Order management
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#85877F]">
                  Review incoming orders and manage fulfilment.
                </p>
              </div>

              <ArrowRight
                size={19}
                className="shrink-0 text-[#85877F] transition group-hover:translate-x-1 group-hover:text-[#174B38]"
              />
            </Link>
          </div>
        </section>

        {/* Bottom Help Banner */}
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#DDE5D8] bg-[#EAF0E7] p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#174B38]">
              <CircleHelp size={20} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#193C2E]">
                Keep your store moving
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#647467]">
                Keep your product listings updated and review your orders regularly.
              </p>
            </div>
          </div>

          <Link
            to="/seller/products"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3 text-xs font-semibold text-white! transition hover:bg-[#103729]"
          >
            Go to products
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default SellerDashboard;
