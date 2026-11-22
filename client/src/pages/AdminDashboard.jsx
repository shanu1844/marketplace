import { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  Store,
  Package,
  ShoppingBag,
  UserCheck,
  Clock3,
  RotateCcw,
  ShieldCheck,
  ArrowUpRight,
  Activity,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

const statItems = [
  {
    title: "Total Users",
    key: "totalUsers",
    icon: Users,
    description: "Registered customers",
    accent: "bg-[#E8F0EB] text-[#174B38]",
  },
  {
    title: "Total Sellers",
    key: "totalSellers",
    icon: Store,
    description: "Marketplace sellers",
    accent: "bg-[#EAF0F7] text-[#42658B]",
  },
  {
    title: "Total Products",
    key: "totalProducts",
    icon: Package,
    description: "Listed marketplace products",
    accent: "bg-[#F4EDE2] text-[#A47738]",
  },
  {
    title: "Total Orders",
    key: "totalOrders",
    icon: ShoppingBag,
    description: "Orders received",
    accent: "bg-[#F1EAF5] text-[#805A98]",
  },
  {
    title: "Seller Applications",
    key: "pendingSellerApplications",
    icon: UserCheck,
    description: "Awaiting admin review",
    accent: "bg-[#F9EFE1] text-[#B27B34]",
    pending: true,
  },
  {
    title: "Pending Orders",
    key: "pendingOrders",
    icon: Clock3,
    description: "Orders requiring attention",
    accent: "bg-[#EAF0F7] text-[#42658B]",
    pending: true,
  },
  {
    title: "Return Requests",
    key: "pendingReturnRequests",
    icon: RotateCcw,
    description: "Returns awaiting review",
    accent: "bg-[#F4EAF0] text-[#A05D7D]",
    pending: true,
  },
];

const initialStats = {
  totalUsers: 0,
  totalSellers: 0,
  totalProducts: 0,
  totalOrders: 0,
  pendingSellerApplications: 0,
  pendingOrders: 0,
  pendingReturnRequests: 0,
};

function AdminDashboard() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard statistics
  useEffect(() => {
    let ignore = false;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard/stats");

        if (!ignore) {
          setStats({
            ...initialStats,
            ...response.data?.stats,
          });
        }
      } catch (err) {
        if (!ignore) {
          console.error("Admin dashboard error:", err);

          setError(
            err.response?.data?.message ||
              "Failed to load dashboard statistics.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  // Refresh dashboard data
  const handleRefresh = () => {
    if (!loading) {
      setRefreshKey((prev) => prev + 1);
    }
  };

  const totalPending =
    Number(stats.pendingSellerApplications || 0) +
    Number(stats.pendingOrders || 0) +
    Number(stats.pendingReturnRequests || 0);

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-3 py-5 sm:px-5 md:flex-row lg:gap-7 lg:px-8 lg:py-8">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="w-full min-w-0 flex-1">
          {/* Header */}
          <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A9185]">
                <Activity size={14} />
                Marketplace Administration
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#123D2E] sm:text-3xl">
                Dashboard Overview
              </h1>

              <p className="mt-2 text-sm text-[#7B8177]">
                Your marketplace performance and activities at a glance.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3 text-sm font-semibold text-white! shadow-lg shadow-[#174B38]/10 transition hover:bg-[#103729] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh data
            </button>
          </header>

          {/* Welcome Banner */}
          <section className="relative mb-7 overflow-hidden rounded-3xl bg-[#123D2E] p-6 text-white shadow-[0_16px_40px_rgba(18,61,46,0.13)] sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-12 h-52 w-52 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-22.5 right-[25%] h-48 w-48 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#DCE9DC]">
                  <ShieldCheck size={14} />
                  ADMIN CONTROL CENTER
                </div>

                <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  Welcome to your
                  <span className="block text-[#C6D8BE]">
                    marketplace dashboard.
                  </span>
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">
                  Manage your marketplace ecosystem, monitor activity and stay
                  on top of pending operations from one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-36.25 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium text-white/60">
                    Total marketplace users
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {loading
                      ? "..."
                      : Number(stats.totalUsers || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="min-w-36.25 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium text-white/60">
                    Pending activities
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#E7D4A8]">
                    {loading ? "..." : totalPending.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="font-semibold underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          {/* Section Heading */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#173F2E]">
                Marketplace statistics
              </h2>
              <p className="mt-1 text-xs text-[#858A80]">
                An overview of your marketplace data.
              </p>
            </div>

            <span className="hidden items-center gap-1.5 rounded-full bg-[#E9EFE6] px-3 py-1.5 text-[11px] font-semibold text-[#456A4F] sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#548B5F]" />
              Dashboard
            </span>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statItems.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.key}
                  className="group rounded-2xl border border-[#E8E6DD] bg-white p-5 shadow-[0_4px_18px_rgba(18,61,46,0.025)] transition duration-300 hover:-translate-y-1 hover:border-[#CAD8C9] hover:shadow-[0_12px_28px_rgba(18,61,46,0.07)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#687267]">
                      {stat.title}
                    </p>

                    <div
                      className={`rounded-xl p-3 transition group-hover:scale-105 ${stat.accent}`}
                    >
                      <Icon size={19} strokeWidth={1.9} />
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-2">
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight text-[#173F2E]">
                        {loading
                          ? "..."
                          : Number(stats[stat.key] || 0).toLocaleString(
                              "en-IN",
                            )}
                      </h3>

                      <p className="mt-2 text-xs text-[#92978D]">
                        {stat.description}
                      </p>
                    </div>

                    {stat.pending && (
                      <span className="mb-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#A47738]">
                        <ArrowUpRight size={13} />
                        Pending
                      </span>
                    )}
                  </div>

                  {loading && (
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#EEF0E9]">
                      <div className="h-full w-1/2 animate-pulse rounded-full bg-[#AFC4AE]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pending Overview */}
          <section className="mt-7 rounded-3xl border border-[#E8E6DD] bg-white p-5 shadow-[0_4px_18px_rgba(18,61,46,0.025)] sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#173F2E]">
                  Pending operations
                </h2>
                <p className="mt-1 text-xs text-[#858A80]">
                  Activities that may require your attention.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-[#A47738]">
                <Clock3 size={16} />
                {loading ? "Loading..." : `${totalPending} pending`}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {statItems
                .filter((stat) => stat.pending)
                .map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.key}
                      className="flex items-center gap-3 rounded-2xl bg-[#F8F8F4] p-4"
                    >
                      <div className={`rounded-xl p-2.5 ${stat.accent}`}>
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#858A80]">
                          {stat.title}
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#173F2E]">
                          {loading
                            ? "..."
                            : Number(stats[stat.key] || 0).toLocaleString(
                                "en-IN",
                              )}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* Footer Information */}
          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-[#E8E6DD] bg-[#F0F1E9] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 text-[#174B38]">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#234331]">
                  Marketplace administration
                </p>
                <p className="mt-1 text-xs text-[#858A80]">
                  Manage users, sellers, products, orders and returns.
                </p>
              </div>
            </div>

            <div className="text-xs font-medium text-[#7F877B]">
              MarketHub Admin
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
