import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserRound,
  Store,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Filter,
  CalendarDays,
  Mail,
  Hash,
  X,
} from "lucide-react";

import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";

const INITIAL_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  limit: 10,
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch users
  useEffect(() => {
    let ignore = false;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/users", {
          params: {
            page,
            limit: 10,
            search,
            role,
          },
        });

        if (!ignore) {
          setUsers(response.data?.users || []);

          setPagination(
            response.data?.pagination || INITIAL_PAGINATION
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || "Failed to load users."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      ignore = true;
    };
  }, [page, search, role, refreshKey]);

  // Search handler
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  // Role filter handler
  const handleRoleChange = (value) => {
    setRole(value);
    setPage(1);
  };

  // Reset filters
  const clearFilters = () => {
    setSearch("");
    setRole("all");
    setPage(1);
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Current page statistics
  const pageStats = useMemo(() => {
    const buyers = users.filter(
      (user) => user.role?.toLowerCase() === "buyer"
    ).length;

    const sellers = users.filter(
      (user) => user.role?.toLowerCase() === "seller"
    ).length;

    return {
      buyers,
      sellers,
    };
  }, [users]);

  const totalPages = Math.max(pagination.totalPages || 1, 1);
  const totalUsers = pagination.totalUsers ?? 0;

  const hasActiveFilters = search.trim() !== "" || role !== "all";

  return (
    <div className="min-h-screen w-full bg-[#F7F6F0]">
      <div className="grid w-full grid-cols-1 gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[256px_minmax(0,1fr)] lg:px-8">

        <AdminSidebar />

        <main className="min-w-0 w-full">

          {/* Header */}
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#66816E]">
                <ShieldCheck size={16} />
                Administration
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#243B2D] sm:text-3xl">
                Users Management
              </h1>

              <p className="mt-2 text-sm text-[#85877F]">
                Manage buyers and sellers across your marketplace.
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244A38] px-5 py-3 text-sm font-semibold text-white! shadow-sm transition hover:bg-[#193A2A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh Users
            </button>
          </div>

          {/* Welcome Banner */}
          <section className="relative mb-7 overflow-hidden rounded-2xl bg-[#173F2E] p-6 text-white shadow-lg sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-white/10" />

            <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                  <Users size={13} />
                  Marketplace Community
                </div>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Your Marketplace, Your Community.
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
                  Keep track of your marketplace members, monitor buyer
                  and seller activity, and maintain a healthy community.
                </p>
              </div>

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <Users size={38} strokeWidth={1.5} />
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Total Users */}
            <div className="rounded-2xl border border-[#E8E5DC] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#85877F]">
                    Total Marketplace Users
                  </p>

                  <h3 className="mt-3 text-3xl font-bold text-[#243B2D]">
                    {totalUsers.toLocaleString("en-IN")}
                  </h3>

                  <p className="mt-2 text-xs text-[#92948B]">
                    Registered members
                  </p>
                </div>

                <div className="rounded-xl bg-[#EAF1E9] p-3">
                  <Users size={23} className="text-[#315D40]" />
                </div>
              </div>
            </div>

            {/* Buyers on current page */}
            <div className="rounded-2xl border border-[#E8E5DC] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#85877F]">
                    Buyers on This Page
                  </p>

                  <h3 className="mt-3 text-3xl font-bold text-[#243B2D]">
                    {loading ? "—" : pageStats.buyers}
                  </h3>

                  <p className="mt-2 text-xs text-[#92948B]">
                    Current page records
                  </p>
                </div>

                <div className="rounded-xl bg-[#EDF2F8] p-3">
                  <UserRound size={23} className="text-[#55769B]" />
                </div>
              </div>
            </div>

            {/* Sellers on current page */}
            <div className="rounded-2xl border border-[#E8E5DC] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#85877F]">
                    Sellers on This Page
                  </p>

                  <h3 className="mt-3 text-3xl font-bold text-[#243B2D]">
                    {loading ? "—" : pageStats.sellers}
                  </h3>

                  <p className="mt-2 text-xs text-[#92948B]">
                    Current page records
                  </p>
                </div>

                <div className="rounded-xl bg-[#F5EFE3] p-3">
                  <Store size={23} className="text-[#A47B3D]" />
                </div>
              </div>
            </div>

            {/* Current Page */}
            <div className="rounded-2xl border border-[#E8E5DC] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#85877F]">
                    Current Page
                  </p>

                  <h3 className="mt-3 text-3xl font-bold text-[#243B2D]">
                    {pagination.currentPage || page}
                    <span className="ml-1 text-lg font-medium text-[#A2A49C]">
                      / {totalPages}
                    </span>
                  </h3>

                  <p className="mt-2 text-xs text-[#92948B]">
                    {users.length} records displayed
                  </p>
                </div>

                <div className="rounded-xl bg-[#F0EEEA] p-3">
                  <UserCheck size={23} className="text-[#77786F]" />
                </div>
              </div>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="mb-6 rounded-2xl border border-[#E8E5DC] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Filter size={17} className="text-[#315D40]" />

              <h2 className="text-sm font-semibold text-[#243B2D]">
                Search & Filters
              </h2>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9D94]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full rounded-xl border border-[#E7E5DC] bg-[#FDFCFA] py-3 pl-11 pr-10 text-sm text-[#243B2D] outline-none transition placeholder:text-[#A3A49D] focus:border-[#315D40] focus:ring-2 focus:ring-[#315D40]/10"
                />

                {search && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#92948B] transition hover:bg-[#F0F0EA] hover:text-[#243B2D]"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Role Filter */}
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="min-w-full cursor-pointer rounded-xl border border-[#E7E5DC] bg-[#FDFCFA] px-4 py-3 text-sm text-[#243B2D] outline-none transition focus:border-[#315D40] focus:ring-2 focus:ring-[#315D40]/10 lg:min-w-47.5 lg:max-w-55"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyers Only</option>
                <option value="seller">Sellers Only</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7E5DC] px-4 py-3 text-sm font-medium text-[#667367] transition hover:bg-[#F7F6F0]"
                >
                  <X size={15} />
                  Clear Filters
                </button>
              )}
            </div>
          </section>

          {/* Users Table */}
          <section className="overflow-hidden rounded-2xl border border-[#E8E5DC] bg-white shadow-sm">

            {/* Table Header */}
            <div className="flex flex-col justify-between gap-3 border-b border-[#EEEAE1] px-5 py-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-[#243B2D]">
                  All Marketplace Users
                </h2>

                <p className="mt-1 text-xs text-[#92948B]">
                  Showing {users.length} of{" "}
                  {totalUsers.toLocaleString("en-IN")} users
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#F0F4EF] px-3 py-2 text-xs font-medium text-[#315D40]">
                <span className="h-2 w-2 rounded-full bg-[#4D875B]" />
                User Directory
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="space-y-4 p-5">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-4 py-3"
                  >
                    <div className="h-11 w-11 rounded-full bg-[#EDEDE7]" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-36 rounded bg-[#EDEDE7]" />
                      <div className="h-3 w-52 max-w-full rounded bg-[#F1F0EB]" />
                    </div>

                    <div className="hidden h-7 w-20 rounded-full bg-[#EDEDE7] sm:block" />
                    <div className="hidden h-3 w-24 rounded bg-[#EDEDE7] md:block" />
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <div className="px-5 py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                  <RefreshCw size={24} className="text-red-500" />
                </div>

                <h3 className="font-semibold text-[#243B2D]">
                  Unable to load users
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#92948B]">
                  {error}
                </p>

                <button
                  onClick={handleRefresh}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#244A38] px-5 py-2.5 text-sm font-semibold text-white! transition hover:bg-[#193A2A]"
                >
                  <RefreshCw size={15} />
                  Try Again
                </button>
              </div>
            ) : users.length === 0 ? (
              /* Empty State */
              <div className="px-5 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F3ED]">
                  <Users size={30} className="text-[#66816E]" />
                </div>

                <h3 className="font-semibold text-[#243B2D]">
                  No users found
                </h3>

                <p className="mt-2 text-sm text-[#92948B]">
                  {hasActiveFilters
                    ? "Try changing your search or filters."
                    : "There are no registered users to display yet."}
                </p>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm font-semibold text-[#315D40] hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Responsive Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-190 text-left">
                    <thead className="bg-[#F8F8F3]">
                      <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#85877F]">
                        <th className="px-5 py-4">User Information</th>
                        <th className="px-5 py-4">Account Role</th>
                        <th className="px-5 py-4">Joined Date</th>
                        <th className="px-5 py-4">User ID</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#F0EEE7]">
                      {users.map((user) => {
                        const isSeller =
                          user.role?.toLowerCase() === "seller";

                        return (
                          <tr
                            key={user._id}
                            className="transition-colors hover:bg-[#FAFAF6]"
                          >
                            {/* User Information */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                    isSeller
                                      ? "bg-[#F5EFE3]"
                                      : "bg-[#EAF1E9]"
                                  }`}
                                >
                                  {isSeller ? (
                                    <Store
                                      size={19}
                                      className="text-[#A47B3D]"
                                    />
                                  ) : (
                                    <UserRound
                                      size={19}
                                      className="text-[#315D40]"
                                    />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[#243B2D]">
                                    {user.name || "Unnamed User"}
                                  </p>

                                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#92948B]">
                                    <Mail size={12} />
                                    {user.email || "No email available"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                                  isSeller
                                    ? "bg-[#F5EFE3] text-[#967039]"
                                    : "bg-[#EAF1E9] text-[#315D40]"
                                }`}
                              >
                                {isSeller ? (
                                  <Store size={13} />
                                ) : (
                                  <UserRound size={13} />
                                )}

                                {user.role || "Unknown"}
                              </span>
                            </td>

                            {/* Joined Date */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-sm text-[#686D64]">
                                <CalendarDays
                                  size={15}
                                  className="text-[#A0A397]"
                                />
                                {formatDate(user.createdAt)}
                              </div>
                            </td>

                            {/* User ID */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-xs text-[#92948B]">
                                <Hash size={13} />

                                <span className="font-mono">
                                  {user._id
                                    ? user._id.slice(-8).toUpperCase()
                                    : "N/A"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-[#EEEAE1] px-5 py-4 sm:flex-row">
                  <div className="text-xs text-[#85877F]">
                    Page{" "}
                    <span className="font-semibold text-[#243B2D]">
                      {pagination.currentPage || page}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[#243B2D]">
                      {totalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={page <= 1 || loading}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E5DC] px-4 py-2.5 text-sm font-medium text-[#405344] transition hover:bg-[#F7F6F0] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <button
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      disabled={page >= totalPages || loading}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#244A38] px-4 py-2.5 text-sm font-semibold text-white! shadow-sm transition hover:bg-[#193A2A] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Footer */}
          <div className="mt-5 flex flex-col justify-between gap-2 pb-4 text-xs text-[#A0A197] sm:flex-row">
            <p>Marketplace Administration · User Management</p>
            <p>Manage your community with confidence.</p>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminUsers;