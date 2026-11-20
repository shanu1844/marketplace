import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  UserPlus,
  ClipboardList,
  RotateCcw,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  Sparkles,
  CalendarDays,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

const INITIAL_STATS = {
  totalUsers: 0,
  totalSellers: 0,
  totalProducts: 0,
  totalOrders: 0,
  pendingSellerApplications: 0,
  pendingOrders: 0,
  pendingReturnRequests: 0,
};

const primaryStats = [
  {
    title: "Total Customers",
    key: "totalUsers",
    description: "Registered marketplace users",
    icon: Users,
    iconStyle: "bg-blue-50 text-blue-700",
    accent: "from-blue-500/10 to-transparent",
    link: "/admin/users",
  },
  {
    title: "Active Sellers",
    key: "totalSellers",
    description: "Approved marketplace sellers",
    icon: Store,
    iconStyle: "bg-emerald-50 text-emerald-700",
    accent: "from-emerald-500/10 to-transparent",
    link: "/admin/sellers",
  },
  {
    title: "Total Products",
    key: "totalProducts",
    description: "Products listed on MarketHub",
    icon: Package,
    iconStyle: "bg-violet-50 text-violet-700",
    accent: "from-violet-500/10 to-transparent",
    link: "/admin/products",
  },
  {
    title: "Total Orders",
    key: "totalOrders",
    description: "Orders across the marketplace",
    icon: ShoppingBag,
    iconStyle: "bg-amber-50 text-amber-700",
    accent: "from-amber-500/10 to-transparent",
    link: "/admin/orders",
  },
];

const activityStats = [
  {
    title: "Seller Applications",
    key: "pendingSellerApplications",
    description: "Applications waiting for review",
    icon: UserPlus,
    link: "/admin/seller-applications",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    title: "Pending Orders",
    key: "pendingOrders",
    description: "Orders awaiting confirmation",
    icon: ClipboardList,
    link: "/admin/orders",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    title: "Return Requests",
    key: "pendingReturnRequests",
    description: "Customer returns awaiting review",
    icon: RotateCcw,
    link: "/admin/returns",
    color: "text-rose-700",
    bg: "bg-rose-50",
  },
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getFormattedDate = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-7">
      <div className="h-60 rounded-[26px] bg-[#DCE5DE]" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-[20px] border border-[#E9E7DF] bg-white p-5"
          >
            <div className="h-10 w-10 rounded-xl bg-[#EAEDE8]" />
            <div className="mt-5 h-3 w-28 rounded bg-[#EAEDE8]" />
            <div className="mt-3 h-7 w-20 rounded bg-[#EAEDE8]" />
            <div className="mt-3 h-3 w-36 rounded bg-[#EAEDE8]" />
          </div>
        ))}
      </div>

      <div className="h-64 rounded-[22px] border border-[#E9E7DF] bg-white" />
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);


  useEffect(() => {
    let isActive = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard/stats");

        if (!isActive) return;

        const data = response.data?.stats || {};

        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalSellers: data.totalSellers ?? 0,
          totalProducts: data.totalProducts ?? 0,
          totalOrders: data.totalOrders ?? 0,
          pendingSellerApplications:
            data.pendingSellerApplications ??
            data.pendingSellerApplication ??
            0,
          pendingOrders: data.pendingOrders ?? 0,
          pendingReturnRequests:
            data.pendingReturnRequests ??
            data.pendingReturnRequest ??
            0,
        });

        setLastUpdated(new Date());
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load dashboard statistics. Please try again."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((previous) => previous + 1);
  };

  const hasPendingTasks =
    stats.pendingSellerApplications > 0 ||
    stats.pendingOrders > 0 ||
    stats.pendingReturnRequests > 0;

  const isInitialLoading = loading && !lastUpdated;

  return (
    <div className="min-h-screen w-full bg-[#F7F6F0]">
      <div className="grid w-full grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-7 lg:px-8 lg:py-7">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Dashboard */}
        <main className="min-w-0 space-y-7">
          {/* Top heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#829087]">
                <LayoutDashboard size={14} />
                Admin workspace
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#203D30] sm:text-3xl">
                Dashboard overview
              </h1>

              <p className="mt-1.5 text-sm text-[#7B8179]">
                Monitor your marketplace performance and daily operations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-[#E8E6DE] bg-white px-3.5 py-2.5 text-xs font-medium text-[#68736A] sm:flex">
                <CalendarDays size={15} className="text-[#315B45]" />
                {getFormattedDate()}
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244A38] px-4 py-2.5 text-sm font-semibold text-white! shadow-sm transition hover:bg-[#193B2B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Welcome panel */}
          <section className="relative isolate overflow-hidden rounded-[26px] bg-[#173F2E] px-6 py-8 text-white shadow-[0_18px_45px_-24px_rgba(23,63,46,0.55)] sm:px-9 sm:py-10">
            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-16 -top-28 -z-10 h-80 w-80 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-4 -top-16 -z-10 h-56 w-56 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-32 right-1/4 -z-10 h-64 w-64 rounded-full bg-[#A7C6A8]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#DCE9DF]">
                  <Sparkles size={13} />
                  MarketHub Administration
                </div>

                <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[36px]">
                  {getGreeting()}, Admin!
                  <br />
                  <span className="text-[#C3D7C5]">
                    Your marketplace at a glance.
                  </span>
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-6 text-[#D2DFD5] sm:text-base">
                  Stay on top of your marketplace activity, manage sellers,
                  track orders and keep everything running smoothly.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/admin/orders"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#214633] transition hover:bg-[#EAF1EA]"
                  >
                    Manage orders
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/admin/seller-applications"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Review sellers
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 lg:max-w-72.5">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <ShoppingBag size={18} />
                  </div>

                  <p className="text-xs text-[#C3D7C5]">Total orders</p>

                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {formatNumber(stats.totalOrders)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Store size={18} />
                  </div>

                  <p className="text-xs text-[#C3D7C5]">Active sellers</p>

                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {formatNumber(stats.totalSellers)}
                  </p>
                </div>

                <div className="col-span-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D9E9D8]/15">
                      <CheckCircle2 size={18} />
                    </span>

                    <div>
                      <p className="text-sm font-semibold">Marketplace status</p>
                      <p className="mt-0.5 text-xs text-[#C3D7C5]">
                        Dashboard overview
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 rounded-full bg-[#C6E6C9]/15 px-2.5 py-1 text-[11px] font-semibold text-[#D6F0D9]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#91D99B]" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Error state */}
          {error && (
            <div className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <AlertCircle size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-rose-800">
                    Dashboard data unavailable
                  </p>
                  <p className="mt-1 text-sm leading-5 text-rose-700">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Try again
              </button>
            </div>
          )}

          {/* Loading state */}
          {isInitialLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* KPI section */}
              <section>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#879087]">
                      Performance
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-[#203D30] sm:text-xl">
                      Marketplace statistics
                    </h3>
                  </div>

                  <span className="hidden text-xs font-medium text-[#92978F] sm:block">
                    All-time overview
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {primaryStats.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        to={item.link}
                        key={item.key}
                        className="group relative overflow-hidden rounded-[20px] border border-[#E9E7DF] bg-white p-5 shadow-[0_4px_18px_-12px_rgba(30,50,38,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[#CAD9CE] hover:shadow-[0_15px_30px_-18px_rgba(30,50,38,0.25)]"
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 bg-linear-to-br ${item.accent} opacity-0 transition group-hover:opacity-100`}
                        />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${item.iconStyle}`}
                            >
                              <Icon size={21} strokeWidth={1.9} />
                            </div>

                            <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#A0A79F] transition group-hover:bg-[#EDF3EE] group-hover:text-[#244A38]">
                              <ArrowUpRight size={17} />
                            </span>
                          </div>

                          <p className="mt-5 text-sm font-semibold text-[#727B72]">
                            {item.title}
                          </p>

                          <p className="mt-1 text-[30px] font-bold tracking-tight text-[#203D30] tabular-nums">
                            {formatNumber(stats[item.key])}
                          </p>

                          <p className="mt-1 text-xs text-[#9A9E96]">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Pending tasks */}
              <section className="overflow-hidden rounded-[22px] border border-[#E9E7DF] bg-white shadow-[0_4px_18px_-12px_rgba(30,50,38,0.16)]">
                <div className="flex flex-col gap-3 border-b border-[#F0EEE8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#203D30]">
                        Needs your attention
                      </h3>

                      {hasPendingTasks && (
                        <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-[#858B82]">
                      Important tasks that may need your action.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-[#F4F3ED] px-3 py-1.5 text-xs font-semibold text-[#727A70]">
                    {formatNumber(
                      stats.pendingSellerApplications +
                        stats.pendingOrders +
                        stats.pendingReturnRequests
                    )}{" "}
                    pending items
                  </span>
                </div>

                <div className="grid grid-cols-1 divide-y divide-[#F0EEE8] md:grid-cols-3 md:divide-x md:divide-y-0">
                  {activityStats.map((item) => {
                    const Icon = item.icon;
                    const count = stats[item.key];

                    return (
                      <Link
                        to={item.link}
                        key={item.key}
                        className="group flex items-center justify-between gap-3 px-5 py-5 transition hover:bg-[#FAFAF7] sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${item.bg} ${item.color}`}
                          >
                            <Icon size={20} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#35473A]">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#92978F]">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-2xl font-bold text-[#203D30] tabular-nums">
                            {formatNumber(count)}
                          </span>

                          <ArrowUpRight
                            size={17}
                            className="text-[#A6ADA4] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#244A38]"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Quick access */}
              <section>
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#879087]">
                    Shortcuts
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-[#203D30]">
                    Quick access
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {[
                    {
                      label: "Manage users",
                      icon: Users,
                      link: "/admin/users",
                    },
                    {
                      label: "Manage sellers",
                      icon: Store,
                      link: "/admin/sellers",
                    },
                    {
                      label: "Manage products",
                      icon: Package,
                      link: "/admin/products",
                    },
                    {
                      label: "Manage orders",
                      icon: ShoppingBag,
                      link: "/admin/orders",
                    },
                    {
                      label: "Returns",
                      icon: RotateCcw,
                      link: "/admin/returns",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.label}
                        to={item.link}
                        className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#E9E7DF] bg-white p-4 transition hover:border-[#C9D8CD] hover:bg-[#FBFCF9] hover:shadow-sm"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF3EE] text-[#315B45] transition group-hover:bg-[#244A38] group-hover:text-white">
                          <Icon size={19} />
                        </div>

                        <span className="min-w-0 flex-1 truncate text-xs font-bold text-[#415247] sm:text-sm">
                          {item.label}
                        </span>

                        <ArrowUpRight
                          size={15}
                          className="hidden shrink-0 text-[#A0A79F] transition group-hover:text-[#244A38] sm:block"
                        />
                      </Link>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* Footer */}
          <footer className="flex flex-col gap-2 border-t border-[#E8E6DE] pt-5 text-xs text-[#969B92] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} MarketHub. Admin workspace.
            </p>

            <div className="flex items-center gap-2">
              <Clock3 size={13} />

              {lastUpdated
                ? `Last updated at ${lastUpdated.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Waiting for dashboard data"}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;