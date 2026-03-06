import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../../api/useApi";
import EmptyState from "../Common/EmptyState";
import { TableSkeleton } from "../Common/ListSkeleton";

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
  const { get, put } = useApi();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [busyKey, setBusyKey] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedCourse, setSelectedCourse] = useState("");

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const fetchPendingPayments = async () => {
    try {
      setIsFetching(true);
      const response = await get({
        url: "/admin-confi/pending-payments",
        params: {
          month: selectedMonth,
          classId: selectedCourse || undefined,
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
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, [selectedMonth, selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await get({
        url: "/admin-confi/all-classes",
      }).unwrap();
      if (response.status === 200) {
        setCourses(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
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
      setBusyKey(key);
      setMessage("");
      const response = await put({
        url: `/admin-confi/update-fee/${item.classId}/${item.studentId}`,
        data: {
          feeMonth: item.feeMonth,
          paid: true,
          amountPaid: amountValue,
          totalFee: item.totalFee,
        },
      }).unwrap();

      if (response?.status === 200) {
        await fetchPendingPayments();
        setMessage("Payment updated successfully.");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      setMessage(
        error?.response?.data?.message ||
        "Unable to update payment right now."
      );
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm ring-1 ring-orange-500/5">
        <div className="relative bg-gradient-to-br from-orange-50 to-white px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">
                Pending <span className="text-orange-600">Payments</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base">
                Track, manage and process student enrollment fees.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
              <div className="relative group">
                {!searchQuery && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
                <input
                  type="text"
                  placeholder={!searchQuery ? "      Search students..." : ""}
                  className={`block w-full sm:w-64 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm ${!searchQuery ? 'pl-10' : 'pl-4'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  className="flex-1 sm:w-36 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm font-medium"
                  value={String(selectedMonth)}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  className="flex-1 sm:w-44 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm font-medium"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">All courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.classTitle || "Untitled course"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800 animate-fade-in shadow-sm">
          <svg className="h-5 w-5 flex-shrink-0 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{message}</span>
        </div>
      )}

      {isFetching ? (
        <TableSkeleton rows={6} cols={8} />
      ) : filteredPayments.length > 0 ? (
        <>
          {/* Desktop View (Table) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 table-fixed text-sm">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">Student Info</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Course & Month</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Fees (Total/Paid)</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Update Amount</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 w-[180px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredPayments.map((item) => {
                    const key = buildKey(item);
                    const totalFee = Number(item.totalFee || 0);
                    const paidSoFar = Number(item.amountPaid || 0);
                    const balanceDue = Math.max(0, totalFee - paidSoFar);
                    const statusLabel = paidSoFar > 0 ? "Partial" : "Pending";

                    return (
                      <tr key={key} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                              {item.studentName}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">{item.studentEmail || "No Email"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">{item.classTitle}</span>
                            <span className="text-xs font-medium text-orange-600 bg-orange-50 w-fit px-2 py-0.5 rounded-full mt-1">
                              {monthNumberToName(item.feeMonth)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-bold text-slate-900">₹{totalFee}</div>
                            <div className="text-[11px] font-medium text-emerald-600 mt-0.5">Paid: ₹{paidSoFar}</div>
                            {balanceDue > 0 && <div className="text-[11px] font-medium text-rose-500">Due: ₹{balanceDue}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold ring-1 ring-inset ${paidSoFar > 0
                            ? "bg-amber-50 text-amber-700 ring-amber-600/20"
                            : "bg-rose-50 text-rose-700 ring-rose-600/20"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${paidSoFar > 0 ? "bg-amber-500" : "bg-rose-500"}`}></span>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="relative inline-block w-28 group/input">
                            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-orange-500 font-bold">₹</div>
                            <input
                              type="number"
                              min="0"
                              className="w-full pl-8 pr-2 py-1.5 text-sm font-semibold border border-slate-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
                              value={amounts[key] ?? ""}
                              onChange={(e) => handleAmountChange(key, e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => markAsPaid(item)}
                            disabled={busyKey !== null}
                            className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${busyKey === key
                              ? "bg-slate-400"
                              : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200"
                              }`}
                          >
                            {busyKey === key ? (
                              <svg className="animate-spin h-3 w-3 mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : null}
                            {busyKey === key ? "Updating..." : "Process Payment"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View (Cards) */}
          <div className="md:hidden space-y-4">
            {filteredPayments.map((item) => {
              const key = buildKey(item);
              const totalFee = Number(item.totalFee || 0);
              const paidSoFar = Number(item.amountPaid || 0);
              const balanceDue = Math.max(0, totalFee - paidSoFar);
              const statusLabel = paidSoFar > 0 ? "Partial" : "Pending";

              return (
                <div key={key} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-orange-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {item.studentName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">{item.studentEmail || "No Email"}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${paidSoFar > 0
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-y border-slate-50 py-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Course</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.classTitle}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Fee Month</p>
                      <p className="text-xs font-semibold text-orange-600">{monthNumberToName(item.feeMonth)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Fee</p>
                      <p className="text-sm font-bold text-slate-900">₹{totalFee}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Remaining</p>
                      <p className="text-sm font-bold text-rose-500">₹{balanceDue}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-sm font-bold">₹</div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount to pay"
                        className="w-full pl-9 pr-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                        value={amounts[key] ?? ""}
                        onChange={(e) => handleAmountChange(key, e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => markAsPaid(item)}
                      disabled={busyKey !== null}
                      className="w-full flex items-center justify-center py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm shadow-emerald-100 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {busyKey === key && <svg className="animate-spin h-3.5 w-3.5 mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                      {busyKey === key ? "Updating..." : "Process & Mark Paid"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <EmptyState
            title="Clean Slate!"
            description="No pending payments found for the selected criteria."
            actionLabel="Refresh Data"
            onAction={fetchPendingPayments}
          />
        </div>
      )}
    </div>
  );
};

export default PendingPayments;
