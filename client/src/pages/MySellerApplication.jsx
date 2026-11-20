
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Leaf,
  Mail,
  RefreshCw,
  ShieldCheck,
  Store,
  XCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import api from "../services/api";

const statusConfig = {
  pending: {
    label: "Pending review",
    title: "Your seller journey is underway.",
    description:
      "Your application has been received. Our team is reviewing your store details and will update your status here.",
    icon: Clock3,
    theme: "amber",
    step: 2,
  },
  approved: {
    label: "Approved",
    title: "Welcome to the seller community!",
    description:
      "Your application has been approved. Your seller workspace is ready for you to explore.",
    icon: CheckCircle2,
    theme: "green",
    step: 3,
  },
  rejected: {
    label: "Not approved",
    title: "Let's review your next steps.",
    description:
      "Your current application wasn't approved. Please contact the MarketHub team if you need clarification.",
    icon: XCircle,
    theme: "red",
    step: 3,
  },
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function MySellerApplication() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const fetchApplication = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setNotFound(false);

    try {
      const response = await api.get("/seller/my-application");
      const data = response.data?.application;

      setApplication(data || null);

      if (!data) {
        setError(
          "The application details could not be found in the response."
        );
      }
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setApplication(null);
        setNotFound(true);
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to load your application. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialApplication = async () => {
      try {
        const response = await api.get("/seller/my-application");

        if (!isActive) return;

        const data = response.data?.application;
        setApplication(data || null);

        if (!data) {
          setError(
            "The application details could not be found in the response."
          );
        }
      } catch (requestError) {
        if (!isActive) return;

        if (requestError.response?.status === 404) {
          setApplication(null);
          setNotFound(true);
        } else {
          setError(
            requestError.response?.data?.message ||
              "Unable to load your application. Please try again."
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadInitialApplication();

    return () => {
      isActive = false;
    };
  }, []);

  const status = String(application?.status || "").toLowerCase();

  const config = statusConfig[status] || {
    label: "Status unavailable",
    title: "Your application is on record.",
    description:
      "We couldn't identify the current status. Please check again later.",
    icon: FileText,
    theme: "neutral",
    step: 1,
  };

  const StatusIcon = config.icon;

  if (loading) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#f5f4ee] px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#e8eee5]">
            <RefreshCw
              size={24}
              className="animate-spin text-[#174b38]"
            />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-[#173e30]">
            Loading your application
          </h2>
          <p className="mt-2 text-sm text-[#858b80]">
            Retrieving your seller application details...
          </p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#f5f4ee] px-4 py-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-3xl border border-[#e6e5da] bg-white p-8 text-center shadow-sm sm:p-12"
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#eaf0e7] text-[#174b38]">
            <Store size={29} />
          </div>

          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-[#174b38]">
            YOUR SELLER JOURNEY
          </p>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#173e30] sm:text-3xl">
            Your store story starts here.
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#777c73]">
            You haven't submitted a seller application yet. Tell us about
            your store and take the first step.
          </p>

          <Link
            to="/become-seller"
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#174b38] px-5 py-3 text-sm font-semibold text-white! transition hover:bg-[#103a2b] sm:w-auto"
          >
            Apply to become a seller
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#777c73] transition hover:text-[#174b38]"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </motion.section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#f5f4ee] px-4 py-12">
        <section className="w-full max-w-lg rounded-3xl border border-[#e6e5da] bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <RefreshCw size={27} />
          </div>

          <p className="mt-6 text-xs font-bold tracking-[0.15em] text-red-600">
            SOMETHING WENT WRONG
          </p>

          <h1 className="mt-3 text-2xl font-bold text-[#173e30]">
            We couldn't load your application.
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#777c73]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchApplication()}
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#174b38] px-6 py-3 text-sm font-semibold text-white! transition hover:bg-[#103a2b]"
          >
            Try again
            <RefreshCw size={16} />
          </button>
        </section>
      </main>
    );
  }

  const timeline = [
    {
      label: "Application submitted",
      description: "Your store details have been received.",
      complete: true,
      icon: CheckCircle2,
    },
    {
      label: "Application review",
      description: "The MarketHub team reviews your application.",
      complete: config.step >= 2,
      icon: Clock3,
    },
    {
      label:
        status === "rejected" ? "Decision made" : "Seller approval",
      description:
        status === "approved"
          ? "Your seller account has been approved."
          : status === "rejected"
            ? "Your application decision is available."
            : "The final approval decision is pending.",
      complete: status === "approved" || status === "rejected",
      icon:
        status === "rejected"
          ? XCircle
          : status === "approved"
            ? CheckCircle2
            : Store,
    },
  ];

  const themeStyles = {
    amber: {
      hero: "bg-[#173f31]",
      icon: "bg-white/10 text-[#f4d69b]",
      badge: "bg-amber-100 text-amber-900",
      accent: "text-[#f4d69b]",
      progress: "bg-[#e9c47d]",
    },
    green: {
      hero: "bg-[#173f31]",
      icon: "bg-white/10 text-[#c4e2c5]",
      badge: "bg-[#dcebd9] text-[#174b38]",
      accent: "text-[#c4e2c5]",
      progress: "bg-[#c4e2c5]",
    },
    red: {
      hero: "bg-[#3d302e]",
      icon: "bg-white/10 text-[#f2b5a9]",
      badge: "bg-red-100 text-red-800",
      accent: "text-[#f2b5a9]",
      progress: "bg-[#e8a99b]",
    },
    neutral: {
      hero: "bg-[#263c32]",
      icon: "bg-white/10 text-white",
      badge: "bg-white/15 text-white",
      accent: "text-white/70",
      progress: "bg-white/50",
    },
  };

  const theme = themeStyles[config.theme];

  return (
    <main className="min-h-screen bg-[#f5f4ee] px-4 py-7 sm:px-6 lg:px-9 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-7">

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8eee5] px-3 py-1.5 text-[11px] font-bold tracking-[0.13em] text-[#174b38]">
              <Leaf size={14} />
              YOUR SELLER SPACE
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#173e30] sm:text-3xl">
              Application status
              <span className="text-[#8b9d80]">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#777c73]">
              Track your seller application and stay informed about
              your journey with MarketHub.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchApplication(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#dfe3d9] bg-white px-4 py-2.5 text-sm font-semibold text-[#174b38] transition hover:bg-[#edf2e9] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh status
          </button>
        </motion.div>

        {/* Main status hero */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-sm sm:p-8 lg:p-10 ${theme.hero}`}
        >
          <div className="absolute -right-20 -top-32 size-80 rounded-full border-38 border-white/4" />
          <div className="absolute -bottom-36 right-36 size-72 rounded-full bg-white/4 blur-2xl" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div
                className={`flex size-14 items-center justify-center rounded-2xl ${theme.icon}`}
              >
                <StatusIcon size={27} />
              </div>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ${theme.badge}`}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {config.label}
              </span>
            </div>

            <div className="mt-8 max-w-2xl">
              <p className={`text-xs font-bold tracking-[0.17em] ${theme.accent}`}>
                APPLICATION UPDATE
              </p>

              <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {config.title}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
                {config.description}
              </p>
            </div>

            {/* Timeline */}
            <div className="mt-10 grid grid-cols-1 gap-5 border-t border-white/15 pt-7 sm:grid-cols-3 sm:gap-4">
              {timeline.map((step) => {
                const StepIcon = step.icon;

                return (
                  <div key={step.label} className="relative flex gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                        step.complete
                          ? "bg-white text-[#174b38]"
                          : "border border-white/20 bg-white/5 text-white/55"
                      }`}
                    >
                      <StepIcon size={17} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          step.complete ? "text-white" : "text-white/60"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/50">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Application details */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="overflow-hidden rounded-3xl border border-[#e5e5da] bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efefe8] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf0e7] text-[#174b38]">
                <FileText size={19} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#173e30]">
                  Application details
                </h2>
                <p className="mt-1 text-xs text-[#92978e]">
                  Information submitted with your application
                </p>
              </div>
            </div>

            <span className="rounded-full border border-[#e5e8df] bg-[#fafbf7] px-3 py-1.5 text-[11px] font-semibold text-[#647566]">
              Application record
            </span>
          </div>

          <div className="grid gap-px bg-[#efefe8] sm:grid-cols-2">
            <div className="bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#92978e]">
                <Store size={15} />
                Store name
              </div>
              <p className="mt-2 text-base font-semibold text-[#26392d]">
                {application?.storeName || "Not available"}
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#92978e]">
                <CalendarDays size={15} />
                Submitted on
              </div>
              <p className="mt-2 text-base font-semibold text-[#26392d]">
                {formatDate(application?.createdAt)}
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#92978e]">
                <FileText size={15} />
                Store description
              </div>
              <p className="mt-2 text-sm leading-6 text-[#465448]">
                {application?.description || "No description provided"}
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#92978e]">
                <Phone size={15} />
                Contact number
              </div>
              <p className="mt-2 text-base font-semibold text-[#26392d]">
                {application?.phone || "Not available"}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Next step */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="flex flex-col gap-5 rounded-3xl border border-[#e2e5da] bg-[#edf1e9] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#174b38] shadow-sm">
              {status === "approved" ? (
                <Sparkles size={21} />
              ) : status === "rejected" ? (
                <Mail size={21} />
              ) : (
                <ShieldCheck size={21} />
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#173e30]">
                {status === "approved"
                  ? "Ready for your next step?"
                  : status === "rejected"
                    ? "Need more information?"
                    : "What happens next?"}
              </h3>

              <p className="mt-1 max-w-xl text-sm leading-6 text-[#6f796d]">
                {status === "approved"
                  ? "Your seller tools are ready. Visit your dashboard to manage your store."
                  : status === "rejected"
                    ? "Contact the MarketHub team if you need clarification about your application decision."
                    : "Your application will be reviewed by our team. Check this page for the latest status."}
              </p>
            </div>
          </div>

          {status === "approved" ? (
            <Link
              to="/seller/dashboard"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#174b38] px-5 py-3 text-sm font-semibold text-white! transition hover:bg-[#103a2b]"
            >
              Open dashboard
              <ArrowRight size={16} />
            </Link>
          ) : status === "rejected" ? (
            <Link
              to="/"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#174b38] transition hover:bg-[#e3eade]"
            >
              Back to home
              <ArrowRight size={16} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => fetchApplication(true)}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#174b38] px-5 py-3 text-sm font-semibold text-white! transition hover:bg-[#103a2b] disabled:opacity-50"
            >
              Refresh status
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          )}
        </motion.section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e5da] pt-5 text-xs text-[#92978e]">
          <span>MarketHub · Seller application center</span>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-medium text-[#647566] transition hover:text-[#174b38]"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default MySellerApplication;
