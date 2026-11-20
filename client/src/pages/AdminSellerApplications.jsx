import { useCallback, useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

import {
  Store,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  User,
  Mail,
  Phone,
  CalendarDays,
  Building2,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  X,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import api from "../services/api";

/* ----------------------------------
   Constants
---------------------------------- */

const FILTERS = [
  { label: "All applications", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_CONFIG = {
  pending: {
    label: "Pending review",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

/* ----------------------------------
   Reusable Components
---------------------------------- */

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold capitalize ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

function SummaryCard({ title, value, description, icon: Icon, theme }) {
  const themes = {
    amber: {
      icon: "bg-amber-50 text-amber-700",
      accent: "bg-amber-400",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      accent: "bg-emerald-400",
    },
    rose: {
      icon: "bg-rose-50 text-rose-700",
      accent: "bg-rose-400",
    },
  };

  const currentTheme = themes[theme];

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[#E9E7DF] bg-white p-5 shadow-[0_4px_18px_-12px_rgba(30,50,38,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[#C9D8CD] hover:shadow-[0_15px_30px_-18px_rgba(30,50,38,0.25)]">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${currentTheme.accent} opacity-0 transition group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#7B847A]">{title}</p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#203D30] tabular-nums">
            {formatNumber(value)}
          </h3>

          <p className="mt-2 text-xs text-[#9A9F96]">{description}</p>
        </div>

        <div className={`rounded-[14px] p-3 ${currentTheme.icon}`}>
          <Icon size={21} strokeWidth={1.9} />
        </div>
      </div>
    </div>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[22px] border border-[#E9E7DF] bg-white p-5"
        >
          <div className="flex justify-between">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#E9EDE8]" />

              <div className="space-y-2 pt-1">
                <div className="h-4 w-36 rounded bg-[#E9EDE8]" />
                <div className="h-3 w-24 rounded bg-[#E9EDE8]" />
              </div>
            </div>

            <div className="h-7 w-24 rounded-full bg-[#E9EDE8]" />
          </div>

          <div className="mt-7 space-y-4">
            <div className="h-3 w-40 rounded bg-[#E9EDE8]" />
            <div className="h-3 w-52 rounded bg-[#E9EDE8]" />
            <div className="h-3 w-32 rounded bg-[#E9EDE8]" />
          </div>

          <div className="mt-7 h-24 rounded-xl bg-[#F0F1EC]" />

          <div className="mt-5 flex gap-3">
            <div className="h-11 flex-1 rounded-xl bg-[#E9EDE8]" />
            <div className="h-11 flex-1 rounded-xl bg-[#E9EDE8]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailItem({ icon: Icon, children }) {
  return (
    <div className="flex min-w-0 items-start gap-3 text-sm text-[#68746A]">
      <Icon
        size={16}
        className="mt-0.5 shrink-0 text-[#315B45]"
        strokeWidth={1.9}
      />
      <span className="min-w-0 wrap-break-word">{children || "Not provided"}</span>
    </div>
  );
}

/* ----------------------------------
   Main Component
---------------------------------- */

function AdminSellerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  /* ----------------------------------
     Fetch Applications
  ---------------------------------- */

  useEffect(() => {
    let ignore = false;

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/seller/applications");

        if (!ignore) {
          const applicationList = response.data?.applications || [];

setApplications(
  applicationList.map((application) => ({
    ...application,
    _id: application._id || application.id,
    applicant: application.applicant
      ? {
          ...application.applicant,
          _id:
            application.applicant._id ||
            application.applicant.id,
        }
      : null,
  }))
);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Seller applications error:", err);

          setError(
            err.response?.data?.message ||
              "Failed to load seller applications. Please try again."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchApplications();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  /* ----------------------------------
     Approve / Reject Application
  ---------------------------------- */

const handleApplicationStatus = async (applicationId, status) => {
  if (
    !applicationId ||
    !/^[a-fA-F0-9]{24}$/.test(String(applicationId))
  ) {
    setError(
      "Invalid or missing application ID. Please refresh applications."
    );
    return;
  }

  const action = status === "approved" ? "approve" : "reject";

  const confirmed = window.confirm(
    `Are you sure you want to ${action} this seller application?`
  );

  if (!confirmed) return;

  try {
    setUpdatingId(applicationId);
    setError("");

    await api.patch(
      `/seller/applications/${applicationId}/status`,
      { status }
    );

    setApplications((previousApplications) =>
      previousApplications.map((application) =>
        application._id === applicationId
          ? { ...application, status }
          : application
      )
    );
  } catch (err) {
    console.error("Application status update error:", err);

    setError(
      err.response?.data?.message ||
        `Failed to ${action} application. Please try again.`
    );
  } finally {
    setUpdatingId(null);
  }
};


  /* ----------------------------------
     Summary Statistics
  ---------------------------------- */

  const summary = useMemo(
    () => ({
      total: applications.length,

      pending: applications.filter(
        (item) => item.status === "pending"
      ).length,

      approved: applications.filter(
        (item) => item.status === "approved"
      ).length,

      rejected: applications.filter(
        (item) => item.status === "rejected"
      ).length,
    }),
    [applications]
  );

  /* ----------------------------------
     Search & Filter
  ---------------------------------- */

  const filteredApplications = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesFilter =
        activeFilter === "all" || application.status === activeFilter;

      const matchesSearch =
        !searchValue ||
        application.storeName?.toLowerCase().includes(searchValue) ||
        application.applicant?.name?.toLowerCase().includes(searchValue) ||
        application.applicant?.email?.toLowerCase().includes(searchValue);

      return matchesFilter && matchesSearch;
    });
  }, [applications, activeFilter, searchTerm]);

  /* ----------------------------------
     Render
  ---------------------------------- */

  return (
    <div className="min-h-screen w-full bg-[#F7F6F0]">
      <div className="grid w-full grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-7 lg:px-8 lg:py-7">
        <AdminSidebar />

        <main className="min-w-0 space-y-7">
          {/* Header */}

          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#879087]">
                <Store size={14} />
                Marketplace administration
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#203D30] sm:text-3xl">
                Seller applications
              </h1>

              <p className="mt-1.5 text-sm text-[#7B8179]">
                Review seller registrations and manage marketplace
                applications.
              </p>
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
              Refresh applications
            </button>
          </section>

          {/* Welcome Panel */}

          <section className="relative isolate overflow-hidden rounded-[25px] bg-[#173F2E] px-6 py-7 text-white shadow-[0_18px_45px_-24px_rgba(23,63,46,0.55)] sm:px-8 sm:py-9">
            <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-8 -top-16 -z-10 h-52 w-52 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-32 right-1/4 -z-10 h-64 w-64 rounded-full bg-[#A7C6A8]/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#DCE9DF]">
                  <Sparkles size={13} />
                  Seller management
                </div>

                <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  Build a trusted marketplace.
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-[#D2DFD5]">
                  Review applications carefully, verify seller information and
                  maintain quality across MarketHub.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-65">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-200">
                    <Clock3 size={19} />
                  </div>

                  <p className="text-xs text-[#C3D7C5]">Awaiting review</p>

                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {formatNumber(summary.pending)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                    <ShieldCheck size={19} />
                  </div>

                  <p className="text-xs text-[#C3D7C5]">Approved sellers</p>

                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {formatNumber(summary.approved)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Error State */}

          {error && (
            <div className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <AlertCircle size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-rose-800">
                    Something went wrong
                  </p>

                  <p className="mt-1 text-sm text-rose-700">{error}</p>
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

          {/* Summary Cards */}

          <section>
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#879087]">
                Application overview
              </p>

              <h3 className="mt-1 text-lg font-bold text-[#203D30] sm:text-xl">
                Registration statistics
              </h3>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-[20px] border border-[#E9E7DF] bg-white"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                  title="Pending applications"
                  value={summary.pending}
                  description="Waiting for admin approval"
                  icon={Clock3}
                  theme="amber"
                />

                <SummaryCard
                  title="Approved applications"
                  value={summary.approved}
                  description="Successfully approved sellers"
                  icon={CheckCircle2}
                  theme="emerald"
                />

                <SummaryCard
                  title="Rejected applications"
                  value={summary.rejected}
                  description="Applications not approved"
                  icon={XCircle}
                  theme="rose"
                />
              </div>
            )}
          </section>

          {/* Search and Filters */}

          <section className="overflow-hidden rounded-[22px] border border-[#E9E7DF] bg-white shadow-[0_4px_18px_-12px_rgba(30,50,38,0.16)]">
            <div className="border-b border-[#F0EEE8] px-5 py-5 sm:px-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#203D30]">
                    All applications
                  </h3>

                  <p className="mt-1 text-sm text-[#858B82]">
                    Search, filter and review seller registrations.
                  </p>
                </div>

                <div className="relative w-full lg:max-w-sm">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#939B91]"
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search store, name or email..."
                    className="w-full rounded-xl border border-[#E8E7DF] bg-[#FCFCFA] py-3 pl-10 pr-10 text-sm text-[#35473A] outline-none transition placeholder:text-[#A1A69E] focus:border-[#315B45] focus:ring-2 focus:ring-[#315B45]/10"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#939B91] hover:text-[#244A38]"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <div className="mr-1 flex items-center gap-2 text-xs font-semibold text-[#92978F]">
                  <SlidersHorizontal size={14} />
                  Filters
                </div>

                {FILTERS.map((filter) => {
                  const isActive = activeFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
                        isActive
                          ? "bg-[#244A38] text-white! shadow-sm"
                          : "bg-[#F5F5F0] text-[#747D73] hover:bg-[#E9EFE9] hover:text-[#244A38]"
                      }`}
                    >
                      {filter.label}

                      {filter.value === "all" && (
                        <span className="ml-2 opacity-70">
                          {summary.total}
                        </span>
                      )}

                      {filter.value === "pending" && (
                        <span className="ml-2 opacity-70">
                          {summary.pending}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result count */}

            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FBFBF8] px-5 py-3 sm:px-6">
              <p className="text-xs font-medium text-[#858B82]">
                Showing{" "}
                <span className="font-bold text-[#35473A]">
                  {filteredApplications.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#35473A]">
                  {applications.length}
                </span>{" "}
                applications
              </p>

              {(searchTerm || activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("all");
                  }}
                  className="text-xs font-semibold text-[#315B45] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </section>

          {/* Applications List */}

          {loading ? (
            <ApplicationSkeleton />
          ) : filteredApplications.length === 0 ? (
            <section className="rounded-[22px] border border-[#E9E7DF] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#EDF3EE] text-[#315B45]">
                {searchTerm || activeFilter !== "all" ? (
                  <Search size={27} />
                ) : (
                  <FileCheck2 size={27} />
                )}
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#203D30]">
                {searchTerm || activeFilter !== "all"
                  ? "No matching applications"
                  : "No applications yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#858B82]">
                {searchTerm || activeFilter !== "all"
                  ? "Try changing your search term or selecting a different status filter."
                  : "New seller registration requests will appear here when submitted."}
              </p>

              {(searchTerm || activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("all");
                  }}
                  className="mt-5 rounded-xl bg-[#244A38] px-5 py-2.5 text-sm font-semibold text-white! transition hover:bg-[#193B2B]"
                >
                  Reset filters
                </button>
              )}
            </section>
          ) : (
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[#35473A]">
                  Seller registration requests
                </h3>

                <span className="text-xs text-[#92978F]">
                  Latest applications first
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {filteredApplications.map((application) => {
                  const isUpdating = updatingId === application._id;
                  const isPending = application.status === "pending";

                  return (
                    <article
                      key={application._id}
                      className="group overflow-hidden rounded-[22px] border border-[#E9E7DF] bg-white shadow-[0_4px_18px_-12px_rgba(30,50,38,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[#CBD9CE] hover:shadow-[0_15px_30px_-18px_rgba(30,50,38,0.24)]"
                    >
                      {/* Card Header */}

                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F0EEE8] px-5 py-5 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#EDF3EE] text-[#315B45]">
                            <Store size={22} strokeWidth={1.8} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-[#203D30]">
                              {application.storeName || "Unnamed store"}
                            </h3>

                            <p className="mt-1 text-xs text-[#92978F]">
                              Seller registration
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={application.status} />
                      </div>

                      {/* Applicant Details */}

                      <div className="space-y-4 px-5 py-5 sm:px-6">
                        <div>
                          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.13em] text-[#9A9F96]">
                            Applicant information
                          </p>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailItem icon={User}>
                              {application.applicant?.name ||
                                "Unknown applicant"}
                            </DetailItem>

                            <DetailItem icon={Mail}>
                              {application.applicant?.email || "No email"}
                            </DetailItem>

                            <DetailItem icon={Phone}>
                              {application.phone || "No phone number"}
                            </DetailItem>

                            <DetailItem icon={CalendarDays}>
                              {formatDate(application.createdAt)}
                            </DetailItem>
                          </div>
                        </div>

                        {/* Description */}

                        <div className="rounded-2xl bg-[#F7F6F0] p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Building2
                              size={15}
                              className="text-[#315B45]"
                            />

                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#315B45]">
                              Store description
                            </p>
                          </div>

                          <p className="text-sm leading-6 text-[#70796F]">
                            {application.description ||
                              "No store description provided."}
                          </p>
                        </div>

                        {/* Application ID */}

                        <div className="flex items-center justify-between gap-3 border-t border-[#F0EEE8] pt-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A0A59D]">
                              Application reference
                            </p>

                            <p className="mt-1 truncate font-mono text-xs text-[#737D73]">
                              {application._id}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs font-medium text-[#A0A59D]">
                            {formatDate(application.createdAt)}
                          </span>
                        </div>

                        {/* Actions */}

                        {isPending ? (
                          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleApplicationStatus(
                                  application._id,
                                  "approved"
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-xl bg-[#244A38] px-4 py-3 text-sm font-bold text-white! shadow-sm transition hover:bg-[#193B2B] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating ? (
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2 size={17} />
                              )}

                              {isUpdating ? "Updating..." : "Approve seller"}
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleApplicationStatus(
                                  application._id,
                                  "rejected"
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <XCircle size={17} />
                              Reject application
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-xl bg-[#F7F6F0] px-4 py-3 text-xs font-semibold text-[#737D73]">
                            <CheckCircle2
                              size={15}
                              className={
                                application.status === "approved"
                                  ? "text-emerald-600"
                                  : "text-rose-500"
                              }
                            />

                            This application has been{" "}
                            {application.status}.
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Footer */}

          <footer className="flex flex-col gap-2 border-t border-[#E8E6DE] pt-5 text-xs text-[#969B92] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} MarketHub. Admin workspace.</p>

            <div className="flex items-center gap-2">
              <ShieldCheck size={14} />
              Seller application management
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default AdminSellerApplications;