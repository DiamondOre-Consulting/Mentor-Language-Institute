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

const buildKey = ({ studentId, classId, feeMonth, feeYear }) =>
  `${studentId}-${classId}-${feeMonth}-${feeYear || "na"}`;

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
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCourse, setSelectedCourse] = useState("");

  const monthOptions = [
    { value: 1, label: "January", short: "Jan" },
    { value: 2, label: "February", short: "Feb" },
    { value: 3, label: "March", short: "Mar" },
    { value: 4, label: "April", short: "Apr" },
    { value: 5, label: "May", short: "May" },
    { value: 6, label: "June", short: "Jun" },
    { value: 7, label: "July", short: "Jul" },
    { value: 8, label: "August", short: "Aug" },
    { value: 9, label: "September", short: "Sep" },
    { value: 10, label: "October", short: "Oct" },
    { value: 11, label: "November", short: "Nov" },
    { value: 12, label: "December", short: "Dec" },
  ];

  const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);

  const fetchPendingPayments = async () => {
    try {
      setIsFetching(true);
      const response = await get({
        url: "/admin-confi/pending-payments",
        params: {
          month: selectedMonth,
          year: selectedYear,
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
            const totalFee = Number(item.totalFee || 0);
            const paidSoFar = Number(item.amountPaid || 0);
            const balanceDue = Math.max(0, totalFee - paidSoFar);
            nextAmounts[key] = balanceDue > 0 ? balanceDue : "";
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
  }, [selectedMonth, selectedYear, selectedCourse]);

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

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = filteredPayments.length;
    const totalExpected = filteredPayments.reduce((acc, curr) => acc + Number(curr.totalFee || 0), 0);
    const totalPaid = filteredPayments.reduce((acc, curr) => acc + Number(curr.amountPaid || 0), 0);
    const totalDue = Math.max(0, totalExpected - totalPaid);

    return {
      totalCount,
      totalExpected,
      totalDue
    };
  }, [filteredPayments]);

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
    const monthValue = Number(item.feeMonth);
    const yearValue = Number(item?.feeYear) || selectedYear || currentYear;
    if (!Number.isInteger(monthValue)) {
      setMessage("Payment period is missing for this record.");
      return;
    }

    try {
      setBusyKey(key);
      setMessage("");
      const response = await put({
        url: `/admin-confi/update-fee/${item.classId}/${item.studentId}`,
        data: {
          feeMonth: monthValue,
          feeYear: yearValue,
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
    <div className="space-y-8 animate-fade-in pb-10 max-w-[1600px] mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
            Pending <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Payments</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            Financial oversight and fee collection management
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Financial Sync
        </div>
      </div>

      {/* Fix #9: Warning about records missing a feeYear */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              Note: Unpaid enrollments without an explicitly assigned fee year will only appear when filtering by the current year.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Pending Records", value: stats.totalCount, sub: "Total entries", color: "blue", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          { label: "Total Revenue", value: `₹${stats.totalExpected.toLocaleString()}`, sub: "Expected total", color: "orange", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Outstanding Dues", value: `₹${stats.totalDue.toLocaleString()}`, sub: "Collective balance", color: "rose", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
            <div className={`p-2.5 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl w-fit mb-4`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            <p className="text-slate-400 text-xs mt-1 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-[2rem] border border-slate-100 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <select
                className="bg-transparent pl-3 pr-8 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none"
                value={String(selectedMonth)}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="w-px h-4 bg-slate-200"></div>
              <select
                className="bg-transparent pl-3 pr-8 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none"
                value={String(selectedYear)}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map((yearValue) => (
                  <option key={yearValue} value={yearValue}>{yearValue}</option>
                ))}
              </select>
            </div>

            <select
              className="flex-1 sm:w-56 pl-4 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Academic Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.classTitle}</option>
              ))}
            </select>

            <button
              onClick={fetchPendingPayments}
              className="p-3.5 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 active:scale-95"
              title="Refresh Data"
            >
              <svg className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
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
        <div className="space-y-4">
          <TableSkeleton rows={8} cols={7} />
        </div>
      ) : filteredPayments.length > 0 ? (
        <>
          <div className="hidden md:block overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student & Curriculum</th>
                    <th scope="col" className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Billing Period</th>
                    <th scope="col" className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ledger Status</th>
                    <th scope="col" className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {filteredPayments.map((item) => {
                    const key = buildKey(item);
                    const totalFee = Number(item.totalFee || 0);
                    const paidSoFar = Number(item.amountPaid || 0);
                    const balanceDue = Math.max(0, totalFee - paidSoFar);
                    const isPartiallyPaid = paidSoFar > 0;
                    const feeYearLabel = Number(item.feeYear) || selectedYear || currentYear;

                    return (
                      <tr key={key} className="hover:bg-slate-50/80 transition-all duration-300 group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 font-bold text-xl ring-4 ring-orange-50/50 group-hover:scale-110 transition-transform">
                              {item.studentName?.charAt(0)}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-black text-slate-900 leading-none group-hover:text-orange-600 transition-colors">
                                {item.studentName}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-400">#{item.studentId?.slice(-6).toUpperCase()}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-[11px] font-black text-slate-700">{item.classTitle}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 uppercase tracking-wide">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {monthNumberToName(item.feeMonth)} {feeYearLabel}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-sm font-black text-slate-900">
                            {monthNumberToName(item.feeMonth)} {feeYearLabel}
                          </div>
                          <p className="mt-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            Recorded Automatically
                          </p>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-black text-slate-900 tracking-tight">Total: ₹{totalFee.toLocaleString()}</div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${isPartiallyPaid
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-rose-50 text-rose-600 border-rose-100"
                                }`}>
                                {isPartiallyPaid ? "Partial" : "Pending"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-[10px] font-bold text-slate-500">Paid: ₹{paidSoFar.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <span className="text-[10px] font-black text-rose-600">Due: ₹{balanceDue.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-3">
                            <div className="inline-flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:bg-white focus-within:border-orange-200 transition-all w-28 group/in">
                              <span className="text-slate-400 text-[10px] font-black mr-2">₹</span>
                              <input
                                type="number"
                                min="0"
                                className="w-full bg-transparent text-xs font-black text-slate-900 outline-none placeholder:text-slate-300"
                                placeholder="0"
                                value={amounts[key] ?? ""}
                                onChange={(e) => handleAmountChange(key, e.target.value)}
                              />
                            </div>
                            <button
                              onClick={() => markAsPaid(item)}
                              disabled={busyKey !== null}
                              className={`h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center ${busyKey === key
                                ? "bg-slate-400"
                                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-200"
                                }`}
                            >
                              {busyKey === key ? (
                                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              ) : "Process"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View (Premium Cards) */}
          <div className="md:hidden grid grid-cols-1 gap-6">
            {filteredPayments.map((item) => {
              const key = buildKey(item);
              const totalFee = Number(item.totalFee || 0);
              const paidSoFar = Number(item.amountPaid || 0);
              const balanceDue = Math.max(0, totalFee - paidSoFar);
              const isPartiallyPaid = paidSoFar > 0;
              const feeYearLabel = Number(item.feeYear) || selectedYear || currentYear;

              return (
                <div key={key} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                  <div className="flex justify-between items-start relative z-10 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-3xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-200">
                        {item.studentName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{item.studentName}</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">#{item.studentId?.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
                    <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Academic Course</p>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.classTitle}</p>
                    </div>
                    <div className="p-4 bg-orange-50/50 rounded-3xl border border-orange-50">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1.5">Billed For</p>
                      <p className="text-sm font-black text-orange-600">{monthNumberToName(item.feeMonth)} {feeYearLabel}</p>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Fee Statistics</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isPartiallyPaid ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {isPartiallyPaid ? 'Partial' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 p-4 bg-white border border-slate-100 rounded-3xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total</p>
                        <p className="text-lg font-black text-slate-900 font-mono">₹{totalFee}</p>
                      </div>
                      <div className="flex-1 p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-center">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Paid</p>
                        <p className="text-lg font-black text-emerald-700 font-mono">₹{paidSoFar}</p>
                      </div>
                    </div>

                    <div className="py-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">
                        Billing Period
                      </p>
                      <div className="text-center text-sm font-black text-orange-600">
                        {monthNumberToName(item.feeMonth)} {feeYearLabel}
                      </div>
                      <p className="mt-2 text-[10px] text-slate-400 font-semibold uppercase tracking-widest text-center">
                        Recorded Automatically
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                        <input
                          type="number"
                          className="w-full pl-9 pr-4 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-black outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all shadow-inner"
                          placeholder="Amount"
                          value={amounts[key] ?? ""}
                          onChange={(e) => handleAmountChange(key, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => markAsPaid(item)}
                        disabled={busyKey !== null}
                        className="p-4 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-200 active:scale-95 disabled:grayscale"
                      >
                        {busyKey === key ? (
                          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
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
