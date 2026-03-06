import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import axios from "../../api/axiosInstance";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { useApi } from "../../api/useApi";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { getToastVariant } from "../../utils/toastVariant";
import {
  validateAmountPaid,
  validateNumber,
  validateRequired,
} from "../../utils/validators";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getShortId = (value) => {
  if (!value) return "N/A";
  const str = String(value);
  if (str.length <= 10) return str;
  return `${str.slice(0, 6)}...${str.slice(-4)}`;
};

const monthNameToNumber = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

const months = Object.keys(monthNameToNumber);
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);
const monthNumberToName = Object.entries(monthNameToNumber).reduce((acc, [name, num]) => {
  acc[num] = name;
  return acc;
}, {});

const hasPaymentDetails = (request) => {
  const amount = Number(request?.amount);
  return Boolean(
    request?.transactionId ||
      request?.paymentMethod ||
      request?.paidOn ||
      request?.payerName ||
      request?.phone ||
      request?.screenshotUrl ||
      (Number.isFinite(amount) && amount > 0)
  );
};

const getPaymentStatusLabel = (request) =>
  hasPaymentDetails(request) ? "Pending" : "Unpaid";

const resolveServerOrigin = () => {
  const base = axios?.defaults?.baseURL || "";
  return base.replace(/\/api\/?$/, "");
};

const Message = () => {
  const { get, put } = useApi();
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("enrollment");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    totalFee: "",
    feeMonth: "",
    feeYear: String(currentYear),
    amountPaid: "",
    rejectionReason: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const toastVariant = getToastVariant(popupMessage);

  const serverOrigin = resolveServerOrigin();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await get({
          url: "/admin-confi/payment-requests?status=pending",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (response.status === 200) {
          setRequests(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching payment requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const hasOpenModal = isFormOpen || !!popupMessage || loading;
    document.body.style.overflow = hasOpenModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFormOpen, popupMessage, loading]);

  const filteredRequests = useMemo(() => {
    const filteredByType = requests.filter((request) =>
      activeType === "fee_payment"
        ? request.requestType === "fee_payment"
        : request.requestType !== "fee_payment"
    );
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return filteredByType;

    return filteredByType.filter((request) => {
      const student = request.studentId || {};
      const course = request.classId || {};
      return [
        student.name,
        student.email,
        student.phone,
        student.userName,
        student.grade,
        student.branch,
        course.classTitle,
        course.grade,
        course.branch,
        request.paymentMethod,
        request.transactionId,
        request.payerName,
        request.phone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(trimmed));
    });
  }, [requests, query, activeType]);

  const openForm = (request) => {
    const paidOnDate = request?.paidOn ? new Date(request.paidOn) : null;
    const monthLabel = request?.feeMonth
      ? monthNumberToName[Number(request.feeMonth)] || ""
      : paidOnDate
        ? paidOnDate.toLocaleDateString("en-US", { month: "long" })
        : "";
    const yearValue =
      Number(request?.feeYear) ||
      (paidOnDate ? paidOnDate.getFullYear() : currentYear);
    const paymentProvided = hasPaymentDetails(request);
    setSelectedRequest(request);
    setFormData({
      totalFee: paymentProvided ? request?.amount ?? "" : "",
      feeMonth: paymentProvided ? monthLabel || "" : "",
      feeYear: String(yearValue),
      amountPaid: paymentProvided ? request?.amount ?? "" : "",
      rejectionReason: "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedRequest(null);
    setFormData({
      totalFee: "",
      feeMonth: "",
      feeYear: String(currentYear),
      amountPaid: "",
      rejectionReason: "",
    });
    setFormErrors({});
    setIsFormOpen(false);
    setPopupMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      const nextErrors = {
        totalFee: validateNumber(next.totalFee, { min: 0, label: "Total fee" }),
        feeMonth: validateRequired(next.feeMonth, "Fee month"),
        feeYear: validateNumber(next.feeYear, {
          min: 2000,
          max: 2100,
          integer: true,
          label: "Fee year",
        }),
        amountPaid: validateAmountPaid(next.amountPaid, next.totalFee, {
          required: true,
        }),
      };
      setFormErrors(nextErrors);
      return next;
    });
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token || !selectedRequest) {
        console.error("Missing token or request");
        return;
      }

      const { totalFee, feeMonth, feeYear, amountPaid } = formData;
      const totalValue = Number(totalFee) || 0;
      const paidValue = Number(amountPaid) || 0;
      const paymentStatus =
        totalValue > 0 && paidValue >= totalValue
          ? "paid"
          : paidValue > 0
            ? "partial"
            : "pending";
      const nextErrors = {
        totalFee: validateNumber(totalFee, { min: 0, label: "Total fee" }),
        feeMonth: validateRequired(feeMonth, "Fee month"),
        feeYear: validateNumber(feeYear, {
          min: 2000,
          max: 2100,
          integer: true,
          label: "Fee year",
        }),
        amountPaid: validateAmountPaid(amountPaid, totalFee, { required: true }),
      };
      setFormErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) {
        setLoading(false);
        return;
      }
      const monthNumber = monthNameToNumber[feeMonth];

      const response = await put({
        url: `/admin-confi/payment-requests/${selectedRequest._id}/approve`,
        data: {
          totalFee: Number(totalFee),
          feeMonth: monthNumber,
          feeYear: Number(feeYear),
          amountPaid: Number(amountPaid),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage(
          selectedRequest?.requestType === "fee_payment"
            ? paymentStatus === "paid"
              ? "Fee payment approved and invoice sent."
              : paymentStatus === "partial"
                ? "Fee payment approved with partial amount recorded."
                : "Fee payment approved with pending balance."
            : paymentStatus === "paid"
              ? "Request approved, invoice sent, student enrolled."
              : paymentStatus === "partial"
                ? "Request approved with partial payment recorded."
                : "Request approved with pending payment."
        );
        setRequests((prev) => prev.filter((req) => req._id !== selectedRequest._id));
        closeForm();
      }
    } catch (error) {
      console.error("Error approving request:", error);
      setPopupMessage("Unable to approve request right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token || !selectedRequest) {
        console.error("Missing token or request");
        return;
      }

      const response = await put({
        url: `/admin-confi/payment-requests/${selectedRequest._id}/reject`,
        data: {
          reason: formData.rejectionReason,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Payment request rejected.");
        setRequests((prev) => prev.filter((req) => req._id !== selectedRequest._id));
        closeForm();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      setPopupMessage("Unable to reject request right now.");
    } finally {
      setLoading(false);
    }
  };

  const resolveScreenshotUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${serverOrigin}${url}`;
  };

  const renderScreenshot = (request) => {
    if (!request?.screenshotUrl) return "Not provided";
    const href = resolveScreenshotUrl(request.screenshotUrl);
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-orange-600 hover:text-orange-700 underline"
      >
        View Screenshot
      </a>
    );
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">
              {activeType === "fee_payment" ? "Fee Payment Requests" : "Enrollment Requests"}
            </h1>
            <p className="text-sm text-slate-500">
              {activeType === "fee_payment"
                ? "Review fee payment details and approve."
                : "Review payment details and approve enrollment."}
            </p>
          </div>
          <div className="w-full sm:w-72">
            <label className="text-xs font-semibold text-slate-500">
              Search
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, course, or transaction..."
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveType("enrollment")}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
              activeType === "enrollment"
                ? "bg-orange-500 text-white shadow-sm"
                : "border border-orange-200 text-orange-700"
            }`}
          >
            Enrollment ({requests.filter((r) => r.requestType !== "fee_payment").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveType("fee_payment")}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
              activeType === "fee_payment"
                ? "bg-orange-500 text-white shadow-sm"
                : "border border-orange-200 text-orange-700"
            }`}
          >
            Fee Payments ({requests.filter((r) => r.requestType === "fee_payment").length})
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>{filteredRequests.length} pending request(s)</span>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-orange-600 hover:text-orange-700"
            >
              Clear search
            </button>
          )}
        </div>

        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-8 text-center text-sm text-slate-600">
            No payment requests right now.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="rounded-2xl border border-orange-100/70 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {request.classId?.classTitle || "Course"}
                      </h3>
                      <Badge variant="secondary">Pending</Badge>
                      <Badge
                        variant="outline"
                        className="border-orange-200 text-orange-700"
                      >
                        {request.requestType === "fee_payment"
                          ? "Fee Payment"
                          : "Enrollment"}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Request ID: {getShortId(request._id)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Grade: {request.classId?.grade || "N/A"} · Hours:{" "}
                      {request.classId?.totalHours || "TBA"} · Branch:{" "}
                      {request.classId?.branch || "Main"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Submitted on {formatDate(request.createdAt)}
                    </p>
                    {request?.feeMonth && (
                      <p className="text-xs text-slate-500">
                        Fee Period: {monthNumberToName[Number(request.feeMonth)] || "N/A"} {request?.feeYear || currentYear}
                      </p>
                    )}
                  </div>
                  <Button size="sm" className="self-start" onClick={() => openForm(request)}>
                    Review & Approve
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Student
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {request.studentId?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Username: {request.studentId?.userName || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Student ID: {getShortId(request.studentId?._id)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Payment
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Status: {getPaymentStatusLabel(request)}
                    </p>
                    {hasPaymentDetails(request) ? (
                      <>
                    <p className="mt-1 text-sm text-slate-700">
                      Method: {request.paymentMethod || "N/A"}
                    </p>
                    <p className="text-sm text-slate-700">
                      Amount: {request.amount}
                    </p>
                    <p className="text-sm text-slate-700">
                      Paid on: {formatDate(request.paidOn)}
                    </p>
                    <p className="text-sm text-slate-700">
                      Payer: {request.payerName || "N/A"}
                    </p>
                    <p className="text-sm text-slate-700">
                      Phone: {request.phone || "N/A"}
                    </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-700">No payment details provided.</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Verification
                    </p>
                    {hasPaymentDetails(request) ? (
                      <>
                        <p className="mt-1 text-sm text-slate-700">
                          Transaction: {request.transactionId || "N/A"}
                        </p>
                        <p className="text-sm text-slate-700">
                          Screenshot: {renderScreenshot(request)}
                        </p>
                        <p className="text-sm text-slate-700">
                          Notes: {request.notes || "N/A"}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-slate-700">No payment details to verify.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay app-modal-overlay--top app-modal-overlay--scroll">
            <div className="app-modal-card app-modal-card-md max-h-[90vh] overflow-y-auto">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                {selectedRequest?.requestType === "fee_payment"
                  ? "Approve Fee Payment"
                  : "Approve Payment Request"}
              </h2>
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Payment Summary
                </p>
                <p className="mt-1 text-slate-700">
                  Status: {getPaymentStatusLabel(selectedRequest)}
                </p>
                <p className="mt-1 text-slate-700">
                  Method: {selectedRequest?.paymentMethod || "N/A"}
                </p>
                <p className="text-slate-700">
                  Transaction: {selectedRequest?.transactionId || "N/A"}
                </p>
                <p className="text-slate-700">
                  Amount: {selectedRequest?.amount || "N/A"}
                </p>
                <p className="text-slate-700">
                  Paid On: {formatDate(selectedRequest?.paidOn)}
                </p>
                <p className="text-slate-700">
                  Screenshot: {renderScreenshot(selectedRequest)}
                </p>
                <p className="text-slate-700">
                  Notes: {selectedRequest?.notes || "N/A"}
                </p>
              </div>

              <form onSubmit={handleApprove}>
                <div className="mb-4">
                  <label
                    htmlFor="totalFee"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Total Fee
                  </label>
                  <input
                    type="text"
                    id="totalFee"
                    name="totalFee"
                    value={formData.totalFee}
                    onChange={handleChange}
                    className="mt-1"
                    required
                    inputMode="decimal"
                  />
                  {formErrors.totalFee && (
                    <p className="mt-1 text-xs text-rose-600">
                      {formErrors.totalFee}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="feeMonth"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Fee Month
                  </label>
                  <select
                    className="mt-1 w-full"
                    onChange={handleChange}
                    value={formData.feeMonth}
                    name="feeMonth"
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  {formErrors.feeMonth && (
                    <p className="mt-1 text-xs text-rose-600">
                      {formErrors.feeMonth}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="feeYear"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Fee Year
                  </label>
                  <select
                    className="mt-1 w-full"
                    onChange={handleChange}
                    value={formData.feeYear}
                    name="feeYear"
                    required
                  >
                    {yearOptions.map((yearValue) => (
                      <option key={yearValue} value={yearValue}>
                        {yearValue}
                      </option>
                    ))}
                  </select>
                  {formErrors.feeYear && (
                    <p className="mt-1 text-xs text-rose-600">
                      {formErrors.feeYear}
                    </p>
                  )}
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="amountPaid"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Amount Paid
                  </label>
                  <input
                    type="text"
                    id="amountPaid"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    className="mt-1"
                    required
                    inputMode="decimal"
                  />
                  {formErrors.amountPaid && (
                    <p className="mt-1 text-xs text-rose-600">
                      {formErrors.amountPaid}
                    </p>
                  )}
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="rejectionReason"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Rejection Reason (optional)
                  </label>
                  <textarea
                    id="rejectionReason"
                    name="rejectionReason"
                    value={formData.rejectionReason}
                    onChange={handleChange}
                    className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Add a note if rejecting..."
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg bg-slate-500 px-4 py-2 text-white hover:bg-slate-600"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-rose-600 hover:bg-rose-100"
                  >
                    Reject
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                  >
                    {selectedRequest?.requestType === "fee_payment"
                      ? "Approve Payment"
                      : "Approve & Enroll"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {popupMessage && (
        <div className="app-toast-overlay">
          <div className={`app-toast-card app-toast-${toastVariant} relative`}>
            <button
              type="button"
              className="app-toast-close"
              onClick={() => setPopupMessage("")}
              aria-label="Close notification"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <p className="pt-2 text-sm font-semibold">{popupMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
