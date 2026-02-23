import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const monthNumberToName = (monthNumber) => {
  if (typeof monthNumber === "string") {
    const trimmed = monthNumber.trim();
    if (!trimmed) {
      return "N/A";
    }
    const numeric = Number(trimmed);
    if (Number.isInteger(numeric)) {
      return monthNumberToName(numeric);
    }
    return trimmed;
  }
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return "N/A";
  }
  return months[monthNumber - 1];
};

const buildKey = ({ studentId, classId, feeMonth }) =>
  `${studentId}-${classId}-${feeMonth}`;

const PendingPayments = () => {
  const navigate = useNavigate();
  const { get, put } = useApi();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [amounts, setAmounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await get({
        url: "/admin-confi/pending-payments",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        const pending = response.data?.pendingPayments || [];
        setPendingPayments(pending);
        const nextAmounts = {};
        pending.forEach((item) => {
          const key = buildKey(item);
          if (nextAmounts[key] === undefined) {
            nextAmounts[key] = item.totalFee ?? "";
          }
        });
        setAmounts(nextAmounts);
      }
    } catch (error) {
      console.error("Error fetching pending payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return pendingPayments;
    }
    return pendingPayments.filter((item) => {
      return (
        item.studentName?.toLowerCase().includes(query) ||
        item.studentEmail?.toLowerCase().includes(query) ||
        item.studentPhone?.toLowerCase().includes(query) ||
        item.classTitle?.toLowerCase().includes(query)
      );
    });
  }, [pendingPayments, searchQuery]);

  const handleAmountChange = (key, value) => {
    setAmounts((prev) => ({ ...prev, [key]: value }));
  };

  const markAsPaid = async (item) => {
    const key = buildKey(item);
    const amountValue = Number(amounts[key]);
    if (!amounts[key] || Number.isNaN(amountValue) || amountValue <= 0) {
      setMessage("Please enter a valid amount before marking paid.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await put({
        url: `/admin-confi/update-fee/${item.classId}/${item.studentId}`,
        data: {
          feeMonth: item.feeMonth,
          paid: true,
          amountPaid: amountValue,
          totalFee: item.totalFee,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response?.status === 200) {
        setPendingPayments((prev) =>
          prev.filter((row) => buildKey(row) !== key)
        );
        setMessage("Payment updated and invoice sent.");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      setMessage(
        error?.response?.data?.message ||
          "Unable to update payment right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-white to-orange-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Pending Payments
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review pending payments and mark them as paid.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search student or course..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                style={{ paddingLeft: "3rem" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Student
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Course
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Month
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Total Fee
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Amount Paid
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((item) => {
                const key = buildKey(item);
                return (
                  <tr key={key} className="hover:bg-orange-50/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">
                        {item.studentName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.studentEmail || "No email"} ·{" "}
                        {item.studentPhone || "No phone"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.classTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {monthNumberToName(item.feeMonth)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.totalFee || 0}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700"
                        value={amounts[key] ?? ""}
                        onChange={(e) =>
                          handleAmountChange(key, e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => markAsPaid(item)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Mark Paid &amp; Send Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-500"
                    colSpan={6}
                  >
                    No pending payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <ClipLoader color="#FFA500" loading={loading} css={override} size={70} />
        </div>
      )}
    </div>
  );
};

export default PendingPayments;
