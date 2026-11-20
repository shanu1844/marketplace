
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  RotateCcw,
  PackageCheck,
  Copy,
  Building2,
  IndianRupee,
  Clock3,
  Package,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import api from "../services/api";

const REASON_LABELS = {
  damaged: "Damaged product",
  wrong_product: "Wrong product received",
  quality_issue: "Quality issue",
  size_issue: "Size issue",
  missing_parts: "Missing parts",
  other: "Other",
};

const STATUS_STYLES = {
  requested: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-blue-50 text-blue-800 ring-blue-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  completed: "bg-[#e7efe7] text-[#174b38] ring-[#d2e1d2]",
};

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const SellerReturnRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);
  const [refundReferences, setRefundReferences] = useState({});

  const fetchRequests = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/orders/seller/return-requests");

      setRequests(response.data?.returnRequests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch return requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadRequests = async () => {
      try {
        const response = await api.get("/orders/seller/return-requests");

        if (!ignore) {
          setRequests(response.data?.returnRequests || []);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "Failed to fetch return requests."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(
        (request) => request.returnStatus === "requested"
      ).length,
      approved: requests.filter(
        (request) => request.returnStatus === "approved"
      ).length,
      completed: requests.filter(
        (request) => request.returnStatus === "completed"
      ).length,
    };
  }, [requests]);

  const getRequestKey = (request) =>
    `${request.orderId}-${request.itemId}`;

  const isUpdating = (request) =>
    updatingItem === getRequestKey(request);

  const handleReview = async (request, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this return request?`
    );

    if (!confirmed) return;

    const key = getRequestKey(request);

    try {
      setUpdatingItem(key);
      setError("");

      await api.patch(
        `/orders/seller/${request.orderId}/items/${request.itemId}/return`,
        { status }
      );

      await fetchRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update return request."
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleMarkReceived = async (request) => {
    const confirmed = window.confirm(
      "Have you physically received and checked this returned product?"
    );

    if (!confirmed) return;

    const key = getRequestKey(request);

    try {
      setUpdatingItem(key);
      setError("");

      const response = await api.patch(
        `/orders/seller/${request.orderId}/items/${request.itemId}/return-received`
      );

      window.alert(
        response.data?.message ||
          "Returned product received successfully."
      );

      await fetchRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to confirm returned product."
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleMarkRefunded = async (request) => {
    const key = getRequestKey(request);
    const refundReference = refundReferences[key]?.trim();

    if (!refundReference) {
      window.alert("Please enter the refund transaction reference.");
      return;
    }

    const confirmed = window.confirm(
      `Have you transferred ₹${formatAmount(
        request.refundAmount
      )} to the buyer?`
    );

    if (!confirmed) return;

    try {
      setUpdatingItem(key);
      setError("");

      const response = await api.patch(
        `/orders/seller/${request.orderId}/items/${request.itemId}/refund`,
        { refundReference }
      );

      window.alert(
        response.data?.message || "Refund completed successfully."
      );

      setRefundReferences((previous) => {
        const updated = { ...previous };
        delete updated[key];
        return updated;
      });

      await fetchRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to complete refund."
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleCopyAccountNumber = async (accountNumber) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      window.alert("Account number copied!");
    } catch {
      window.alert("Unable to copy account number.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f4ee]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce6dc] border-t-[#174b38]" />
          <p className="text-sm font-medium text-[#174b38]">
            Loading return requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4ee] px-4 py-6 sm:px-6 lg:px-9">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl bg-[#123d2e] p-6 text-white shadow-sm sm:p-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-35 border-white/5" />
          <div className="absolute -bottom-28 right-36 h-52 w-52 rounded-full bg-white/5" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#e4eee4]">
                <RotateCcw size={14} />
                Seller operations
              </div>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Return management
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Review customer requests, verify returned products and
                manage manual refunds from one workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchRequests}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white! transition hover:bg-white/20 sm:self-center"
            >
              <RefreshCw size={16} />
              Refresh requests
            </button>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total requests",
              value: stats.total,
              icon: Package,
              color: "bg-[#e8eee5] text-[#174b38]",
            },
            {
              label: "Awaiting review",
              value: stats.pending,
              icon: Clock3,
              color: "bg-amber-50 text-amber-700",
            },
            {
              label: "Approved returns",
              value: stats.approved,
              icon: CheckCircle2,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Completed returns",
              value: stats.completed,
              icon: PackageCheck,
              color: "bg-[#e8eee5] text-[#174b38]",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#e6e5da] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon size={19} />
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-[#a2a69d]"
                  />
                </div>

                <p className="mt-4 text-2xl font-semibold tabular-nums text-[#173e30]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-[#777c73] sm:text-sm">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </section>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Request list heading */}
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#879084]">
              Customer service
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#173e30]">
              Return requests
            </h2>
          </div>

          <span className="rounded-full border border-[#e0e4d9] bg-white px-3 py-1.5 text-xs font-semibold text-[#536457]">
            {requests.length} {requests.length === 1 ? "request" : "requests"}
          </span>
        </section>

        {/* Empty state */}
        {requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d8dfd3] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf0e7] text-[#174b38]">
              <PackageCheck size={30} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-[#173e30]">
              All clear!
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#777c73]">
              You don't have any customer return requests right now.
              New requests will appear here.
            </p>

            <button
              type="button"
              onClick={fetchRequests}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174b38] px-5 py-2.5 text-sm font-semibold text-white! transition hover:bg-[#103a2b]"
            >
              <RefreshCw size={15} />
              Check again
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((request) => {
              const key = getRequestKey(request);
              const updating = isUpdating(request);
              const bankDetails = request.refundDetails;

              const hasBankDetails =
                request.refundMethod === "BANK" &&
                request.refundDetailsSubmittedAt &&
                bankDetails?.accountHolderName &&
                bankDetails?.accountNumber &&
                bankDetails?.ifscCode &&
                bankDetails?.bankName;

              const statusStyle =
                STATUS_STYLES[request.returnStatus] ||
                "bg-gray-100 text-gray-700 ring-gray-200";

              return (
                <article
                  key={key}
                  className="overflow-hidden rounded-3xl border border-[#e5e5d9] bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Request header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#efefe8] px-5 py-4 sm:px-6">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#92978e]">
                        Order reference
                      </p>
                      <p className="mt-1 font-semibold text-[#173e30]">
                        #{String(request.orderId).slice(-8)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyle}`}
                      >
                        {request.returnStatus?.replace(/_/g, " ") || "Unknown"}
                      </span>

                      {updating && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-[#174b38]">
                          <RefreshCw size={13} className="animate-spin" />
                          Updating
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product details */}
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                    <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-[#f1f2ed] sm:h-32 sm:w-32">
                      {request.productImage ? (
                        <img
                          src={request.productImage}
                          alt={request.productName || "Returned product"}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#92978e]">
                          <Package size={30} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#173e30]">
                            {request.productName || "Product"}
                          </h3>
                          <p className="mt-1 text-xs text-[#92978e]">
                            Requested on {formatDate(request.returnRequestedAt)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#f3f5ef] px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-[#899185]">
                            Refund amount
                          </p>
                          <p className="mt-0.5 flex items-center text-lg font-bold text-[#174b38]">
                            <IndianRupee size={15} />
                            {formatAmount(request.refundAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-[#92978e]">Quantity</p>
                          <p className="mt-1 text-sm font-semibold text-[#35463a]">
                            {request.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92978e]">Unit price</p>
                          <p className="mt-1 text-sm font-semibold text-[#35463a]">
                            ₹{formatAmount(request.price)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#92978e]">Return reason</p>
                          <p className="mt-1 text-sm font-semibold text-[#35463a]">
                            {REASON_LABELS[request.returnReason] ||
                              request.returnReason ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>

                      {request.returnDescription && (
                        <div className="mt-4 rounded-xl bg-[#fafaf6] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#92978e]">
                            Customer description
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#596258]">
                            {request.returnDescription}
                          </p>
                        </div>
                      )}

                      {request.buyer && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#777c73]">
                          <span className="font-semibold text-[#35463a]">
                            Buyer:
                          </span>
                          <span>
                            {request.buyer.name || "Customer"}
                          </span>
                          {request.buyer.email && (
                            <span>({request.buyer.email})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approve / Reject */}
                  {request.returnStatus === "requested" && (
                    <div className="flex flex-wrap justify-end gap-3 border-t border-[#efefe8] bg-[#fcfcf9] px-5 py-4 sm:px-6">
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleReview(request, "rejected")}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject request
                      </button>

                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleReview(request, "approved")}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#174b38] px-5 py-2.5 text-sm font-semibold text-white! transition hover:bg-[#103a2b] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} />
                        Approve return
                      </button>
                    </div>
                  )}

                  {/* Approved return */}
                  {request.returnStatus === "approved" && (
                    <div className="border-t border-[#efefe8] bg-[#f9fbf7] p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6eee4] text-[#174b38]">
                            <PackageCheck size={19} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#173e30]">
                              Return approved
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[#777c73]">
                              Verify the returned product physically before
                              marking it as received.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => handleMarkReceived(request)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174b38] px-5 py-3 text-sm font-semibold text-white! transition hover:bg-[#103a2b] disabled:opacity-50"
                        >
                          <PackageCheck size={17} />
                          Mark as received
                        </button>
                      </div>

                      {request.refundMethod === "BANK" && !hasBankDetails && (
                        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                          <AlertCircle size={16} className="mt-0.5 shrink-0" />
                          Buyer has not submitted bank details yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejected */}
                  {request.returnStatus === "rejected" && (
                    <div className="border-t border-red-100 bg-red-50/60 px-5 py-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
                        <XCircle size={17} />
                        This return request was rejected.
                      </p>
                    </div>
                  )}

                  {/* Completed return */}
                  {request.returnStatus === "completed" && (
                    <div className="border-t border-[#e8eee4] bg-[#fbfcf8] px-5 py-5 sm:px-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold text-[#174b38]">
                            <PackageCheck size={18} />
                            Returned product received
                          </p>
                          <p className="mt-1 text-xs text-[#777c73]">
                            Received on {formatDate(request.returnReceivedAt)}
                          </p>
                        </div>

                        <span className="rounded-full bg-[#e7efe7] px-3 py-1.5 text-xs font-semibold capitalize text-[#174b38]">
                          {request.refundStatus || "Refund unavailable"}
                        </span>
                      </div>

                      {/* Bank details */}
                      {hasBankDetails && (
                        <div className="mt-5 rounded-2xl border border-[#e5e8df] bg-white p-4 sm:p-5">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf0e7] text-[#174b38]">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-[#173e30]">
                                Buyer's bank details
                              </h4>
                              <p className="text-xs text-[#92978e]">
                                Verify before transferring the refund
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            {[
                              {
                                label: "Account holder",
                                value: bankDetails.accountHolderName,
                              },
                              {
                                label: "Bank name",
                                value: bankDetails.bankName,
                              },
                              {
                                label: "Account number",
                                value: bankDetails.accountNumber,
                              },
                              {
                                label: "IFSC code",
                                value: bankDetails.ifscCode,
                              },
                            ].map((detail) => (
                              <div key={detail.label}>
                                <p className="text-xs text-[#92978e]">
                                  {detail.label}
                                </p>
                                <p className="mt-1 break-all text-sm font-semibold text-[#35463a]">
                                  {detail.value}
                                </p>

                                {detail.label === "Account number" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyAccountNumber(detail.value)
                                    }
                                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#174b38] hover:underline"
                                  >
                                    <Copy size={13} />
                                    Copy account number
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                            Verify the account holder, account number and IFSC
                            carefully before making a bank transfer.
                          </div>
                        </div>
                      )}

                      {!hasBankDetails &&
                        request.refundStatus === "pending" && (
                          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                            Buyer bank details are not available. Contact the
                            buyer before processing the manual refund.
                          </div>
                        )}

                      {/* Refund summary */}
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-white p-4">
                          <p className="text-xs text-[#92978e]">
                            Refund amount
                          </p>
                          <p className="mt-1 text-lg font-bold text-[#174b38]">
                            ₹{formatAmount(request.refundAmount)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-4">
                          <p className="text-xs text-[#92978e]">
                            Refund method
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#35463a]">
                            {request.refundMethod || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Manual refund form */}
                      {request.refundStatus === "pending" && (
                        <div className="mt-5 rounded-2xl border border-[#e2e7dc] bg-white p-4 sm:p-5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf0e7] text-[#174b38]">
                              <Receipt size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-[#173e30]">
                                Complete manual refund
                              </h4>
                              <p className="text-xs text-[#92978e]">
                                Transfer first, then record the transaction.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <label
                              htmlFor={`refund-${key}`}
                              className="mb-2 block text-xs font-semibold text-[#596258]"
                            >
                              Bank transaction reference
                            </label>

                            <input
                              id={`refund-${key}`}
                              type="text"
                              value={refundReferences[key] || ""}
                              onChange={(event) =>
                                setRefundReferences((previous) => ({
                                  ...previous,
                                  [key]: event.target.value,
                                }))
                              }
                              placeholder="Enter UTR / transaction reference"
                              disabled={updating}
                              className="w-full rounded-xl border border-[#e1e4da] bg-[#fcfcf9] px-4 py-3 text-sm text-[#26392d] outline-none transition placeholder:text-[#a5aa9f] focus:border-[#174b38] focus:ring-2 focus:ring-[#174b38]/10 disabled:opacity-50"
                            />
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="max-w-md text-xs leading-5 text-[#92978e]">
                              This action records a refund that you have
                              already transferred manually. It does not
                              initiate a bank transfer.
                            </p>

                            <button
                              type="button"
                              onClick={() => handleMarkRefunded(request)}
                              disabled={
                                updating ||
                                !hasBankDetails ||
                                !refundReferences[key]?.trim()
                              }
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#174b38] px-5 py-3 text-sm font-semibold text-white! transition hover:bg-[#103a2b] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <CheckCircle2 size={17} />
                              Mark refund completed
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Refund completed */}
                      {request.refundStatus === "refunded" && (
                        <div className="mt-5 rounded-2xl border border-[#dce8d9] bg-[#edf4eb] p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold text-[#174b38]">
                            <CheckCircle2 size={18} />
                            Refund successfully recorded
                          </p>

                          {request.refundedAt && (
                            <p className="mt-2 text-xs text-[#647566]">
                              Refunded on: {formatDate(request.refundedAt)}
                            </p>
                          )}

                          {request.refundReference && (
                            <p className="mt-2 break-all text-xs text-[#647566]">
                              Transaction reference:{" "}
                              <span className="font-semibold">
                                {request.refundReference}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e4e5da] pt-5 text-xs text-[#92978e]">
          <p>MarketHub · Seller return workspace</p>
          <p>Manage returns and refunds responsibly.</p>
        </div>
      </div>
    </div>
  );
};

export default SellerReturnRequests;
