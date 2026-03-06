import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../../../api/useApi";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import paymentQr from "../../../assets/QR.jpeg";
import {
  validateAmountPaid,
  validatePhone,
  validateRequired,
} from "../../../utils/validators";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseClassDateParts = (dateStr = "") => {
  const parts = String(dateStr).split(/[-/]/).map((part) => part.trim());
  if (parts.length < 3) return null;

  let yearPart = "";
  let monthPart = "";
  let dayPart = "";

  if (parts[0].length === 4) {
    yearPart = parts[0];
    monthPart = parts[1];
    dayPart = parts[2];
  } else {
    dayPart = parts[0];
    monthPart = parts[1];
    yearPart = parts[2];
  }

  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
};

const toDateFromParts = (parts) => {
  if (!parts) return null;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toDateSafe = (value) => {
  const parts = parseClassDateParts(value);
  const parsed = toDateFromParts(parts);
  if (parsed) return parsed;
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatDate = (value) => {
  if (!value) return "TBA";
  const date = toDateSafe(value);
  if (!date) return "TBA";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (value) => {
  if (!value) return "TBA";
  const [hh, mm] = String(value).split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return value;
  const date = new Date();
  date.setHours(hh, mm, 0, 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const monthNames = [
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

const monthNumberToLabel = (value) => {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 12) return "N/A";
  return monthNames[num - 1];
};

const getProfileCompletion = (student) => {
  if (!student) return 0;
  const fields = ["name", "email", "phone", "grade", "dob", "userName"];
  const completed = fields.filter((key) => Boolean(student?.[key])).length;
  return Math.round((completed / fields.length) * 100);
};

/* ── Small reusable stat card ────────────────────────────── */
const StatCard = ({ icon, label, value, color = "#f97316", delay = 0 }) => (
  <div
    data-sr="zoom"
    data-sr-delay={delay}
    style={{
      background: "#fff",
      border: "1.5px solid #fed7aa",
      borderRadius: "0.875rem",
      padding: "0.875rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem",
      transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 6px 20px -6px rgba(249,115,22,0.2)";
      e.currentTarget.style.borderColor = "#fb923c";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.borderColor = "#fed7aa";
    }}
  >
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "0.5rem",
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        marginBottom: "0.25rem",
      }}
    >
      {icon}
    </div>
    <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", fontWeight: 600 }}>
      {label}
    </span>
    <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
      {value}
    </span>
  </div>
);

const StudentOverview = ({ student }) => {
  const { get, post } = useApi();
  const [loading, setLoading] = useState(false);
  const [expandedSessionKey, setExpandedSessionKey] = useState(null);
  const [pendingFees, setPendingFees] = useState([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "UPI",
    transactionId: "",
    amount: "",
    paidOn: "",
    payerName: "",
    phone: "",
    notes: "",
    screenshot: null,
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [summary, setSummary] = useState({
    enrolledCount: 0,
    appliedCount: 0,
    totalHours: 0,
    totalScheduled: 0,
    totalAttended: 0,
    totalFee: 0,
    totalPaid: 0,
    balance: 0,
    upcomingSessions: [],
  });

  const buildPaymentErrors = (form, totalFee) => {
    const next = {};
    const hasDetails = Boolean(
      form.transactionId ||
        form.amount ||
        form.paidOn ||
        form.payerName ||
        form.phone ||
        form.screenshot
    );
    if (!hasDetails) {
      next.amount = "Please provide payment details.";
      return next;
    }
    next.transactionId = validateRequired(form.transactionId, "Transaction ID");
    next.amount = validateAmountPaid(form.amount, totalFee, { required: true });
    next.paidOn = validateRequired(form.paidOn, "Paid on date");
    next.payerName = validateRequired(form.payerName, "Payer name");
    next.phone = validatePhone(form.phone);
    return next;
  };

  const profileCompletion = useMemo(() => getProfileCompletion(student), [student]);

  useEffect(() => {
    const classIds = student?.classes || [];
    const appliedCount = student?.appliedClasses?.length || 0;
    if (!student) return;
    if (classIds.length === 0) {
      setSummary((prev) => ({ ...prev, enrolledCount: 0, appliedCount }));
      return;
    }

    const fetchSummary = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const courseResults = await Promise.allSettled(
          classIds.map((id) => get({ url: `/students/all-courses/${id}`, headers }).unwrap())
        );
        const courses = courseResults
          .filter((r) => r.status === "fulfilled" && r.value.status === 200 && r.value.data)
          .map((r) => r.value.data);

        const attendanceResults = await Promise.allSettled(
          classIds.map((id) => get({ url: `/students/my-attendance/${id}`, headers }).unwrap())
        );
        const feeResults = await Promise.allSettled(
          classIds.map((id) => get({ url: `/students/my-fee-details/${id}`, headers }).unwrap())
        );
        let pendingRequestRows = [];
        try {
          const pendingRequestResponse = await get({
            url: "/students/payment-requests",
            params: { status: "pending", type: "fee_payment" },
            headers,
          }).unwrap();
          if (pendingRequestResponse.status === 200) {
            pendingRequestRows = pendingRequestResponse.data || [];
          }
        } catch (requestError) {
          console.error("Error fetching pending payment requests:", requestError);
        }
        const pendingRequestKeys = new Set();
        const pendingRequestClasses = new Set();
        pendingRequestRows.forEach((row) => {
          const classKey = String(row?.classId || "");
          const monthKey = Number(row?.feeMonth);
          if (classKey && Number.isInteger(monthKey)) {
            pendingRequestKeys.add(`${classKey}-${monthKey}`);
          } else if (classKey) {
            pendingRequestClasses.add(classKey);
          }
        });

        const scheduleEntries = courses.flatMap((c) =>
          (c?.dailyClasses || []).map((e) => ({ ...e, courseTitle: c?.classTitle || "Course" }))
        );
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const upcomingSessions = scheduleEntries
          .map((e) => {
            const d = toDateSafe(e.classDate);
            return d ? { ...e, dateValue: d } : null;
          })
          .filter(Boolean)
          .filter((e) => e.dateValue >= todayStart)
          .sort((a, b) => a.dateValue - b.dateValue)
          .slice(0, 3)
          .map((e) => ({ ...e, label: formatDate(e.classDate) }));

        const totalScheduled = scheduleEntries.reduce((t, e) => t + toNumber(e.numberOfClasses), 0);
        const totalHours = courses.reduce((t, c) => t + toNumber(c.totalHours), 0);
        const totalAttended = attendanceResults.reduce((t, r) => {
          if (r.status !== "fulfilled") return t;
          const d = r.value?.data;
          if (!d) return t;
          if (d.totalClassesTaken) return t + toNumber(d.totalClassesTaken);
          return t + (d.detailAttendance || []).reduce((s, row) => s + toNumber(row.numberOfClassesTaken), 0);
        }, 0);
        const totalFee = feeResults.reduce(
          (t, r) => (r.status !== "fulfilled" ? t : t + toNumber(r.value?.data?.totalFee)),
          0
        );
        const totalPaid = feeResults.reduce((t, r) => {
          if (r.status !== "fulfilled") return t;
          return (
            t +
            (r.value?.data?.detailFee || []).reduce(
              (s, f) => s + toNumber(f.amountPaid),
              0
            )
          );
        }, 0);

        const courseTitleMap = new Map(
          courses.map((course) => [String(course?._id), course?.classTitle || "Course"])
        );
        const pendingItems = [];
        const currentMonth = new Date().getMonth() + 1;
        feeResults.forEach((result, index) => {
          if (result.status !== "fulfilled") return;
          const feeData = result.value?.data;
          if (!feeData) return;
          const classId = classIds[index];
          const classTitle = courseTitleMap.get(String(classId)) || "Course";
          const total = toNumber(feeData.totalFee);
          const detailFees = Array.isArray(feeData.detailFee)
            ? feeData.detailFee
            : [];
          const currentDetail = detailFees.find(
            (fee) => Number(fee?.feeMonth) === currentMonth
          );
          if (currentDetail) {
            const paidSoFar = toNumber(currentDetail.amountPaid);
            const balanceDue = Math.max(0, total - paidSoFar);
            const isFullyPaid = total > 0 && paidSoFar >= total;
            if (!isFullyPaid) {
              const key = `${String(classId)}-${Number(currentMonth)}`;
              const awaitingApproval =
                pendingRequestKeys.has(key) || pendingRequestClasses.has(String(classId));
              pendingItems.push({
                classId,
                classTitle,
                feeMonth: currentDetail.feeMonth,
                feeMonthLabel: monthNumberToLabel(currentDetail.feeMonth),
                totalFee: total,
                paidSoFar,
                balanceDue,
                awaitingApproval,
              });
            }
          } else if (total > 0) {
            const key = `${String(classId)}-${Number(currentMonth)}`;
            const awaitingApproval =
              pendingRequestKeys.has(key) || pendingRequestClasses.has(String(classId));
            pendingItems.push({
              classId,
              classTitle,
              feeMonth: currentMonth,
              feeMonthLabel: monthNumberToLabel(currentMonth),
              totalFee: total,
              paidSoFar: 0,
              balanceDue: total,
              awaitingApproval,
            });
          }
        });

        setSummary({
          enrolledCount: classIds.length,
          appliedCount,
          totalHours,
          totalScheduled,
          totalAttended,
          totalFee,
          totalPaid,
          balance: Math.max(0, totalFee - totalPaid),
          upcomingSessions,
        });
        setPendingFees(pendingItems);
      } catch (err) {
        console.error("Error building student summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [student]);

  const openPaymentDialog = (item) => {
    setSelectedPayment(item);
    setPaymentMessage("");
    setPaymentErrors({});
    setPaymentForm({
      paymentMethod: "UPI",
      transactionId: "",
      amount: "",
      paidOn: "",
      payerName: "",
      phone: "",
      notes: "",
      screenshot: null,
    });
    setPaymentDialogOpen(true);
  };

  const submitPayment = async (e) => {
    e?.preventDefault?.();
    if (!selectedPayment) return;
    const totalFee = selectedPayment.totalFee || 0;
    const nextErrors = buildPaymentErrors(paymentForm, totalFee);
    setPaymentErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setPaymentMessage("Please fix the highlighted fields.");
      return;
    }

    try {
      setPaymentSubmitting(true);
      setPaymentMessage("");
      const token = localStorage.getItem("token");
      if (!token) {
        setPaymentMessage("Session expired. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("paymentMethod", paymentForm.paymentMethod || "UPI");
      formData.append("transactionId", paymentForm.transactionId);
      formData.append("amount", paymentForm.amount);
      formData.append("paidOn", paymentForm.paidOn);
      formData.append("payerName", paymentForm.payerName);
      formData.append("phone", paymentForm.phone);
      if (selectedPayment?.feeMonth) {
        formData.append("feeMonth", String(selectedPayment.feeMonth));
      }
      if (paymentForm.screenshot) {
        formData.append("screenshot", paymentForm.screenshot);
      }
      const feeNote = selectedPayment.feeMonthLabel
        ? `Fee month: ${selectedPayment.feeMonthLabel}`
        : "";
      const combinedNotes = [paymentForm.notes, feeNote]
        .map((v) => String(v || "").trim())
        .filter(Boolean)
        .join(" | ");
      if (combinedNotes) {
        formData.append("notes", combinedNotes);
      }

      const response = await post({
        url: `/students/payment-requests/${selectedPayment.classId}`,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 201) {
        setPaymentMessage("Payment request submitted successfully.");
        setPaymentDialogOpen(false);
        setPendingFees((prev) =>
          prev.map((item) =>
            item.classId === selectedPayment.classId &&
            Number(item.feeMonth) === Number(selectedPayment.feeMonth)
              ? { ...item, awaitingApproval: true }
              : item
          )
        );
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        setPaymentMessage("A payment request is already pending for this course.");
      } else {
        setPaymentMessage(
          error?.response?.data?.message ||
            "Unable to submit payment right now."
        );
      }
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const cardStyle = {
    background: "#fff",
    border: "1.5px solid #fed7aa66",
    borderRadius: "1.125rem",
    overflow: "hidden",
    boxShadow: "0 2px 16px -8px rgba(249,115,22,0.1)",
  };

  const cardHeaderStyle = {
    padding: "1rem 1.25rem 0.5rem",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const cardTitleStyle = {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  };

  const balanceColor = summary.balance > 0 ? "#dc2626" : "#16a34a";
  const balanceBg = summary.balance > 0 ? "#fef2f2" : "#f0fdf4";
  const balanceBorder = summary.balance > 0 ? "#fecaca" : "#bbf7d0";

  return (
    <section style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Row 1: Learning Summary + Financial Snapshot */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>

        {/* Learning Summary */}
        <div style={cardStyle} data-sr="fade-up">
          <div style={cardHeaderStyle}>
            <span style={{ fontSize: "1.1rem" }}>📚</span>
            <h3 style={cardTitleStyle}>Learning Summary</h3>
          </div>
          <div style={{ padding: "1rem 1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <StatCard icon="🎓" label="Enrolled" value={summary.enrolledCount} delay={100} />
              <StatCard icon="📝" label="Applied" value={summary.appliedCount} color="#6366f1" delay={150} />
              <StatCard icon="⏱️" label="Total Hours" value={`${summary.totalHours || 0}h`} color="#0ea5e9" delay={200} />
              <StatCard icon="✅" label="Classes Taken" value={summary.totalAttended || 0} color="#10b981" delay={250} />
            </div>
            {summary.totalScheduled > 0 && (
              <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#94a3b8" }}>
                📆 {summary.totalScheduled} total sessions scheduled
              </p>
            )}
          </div>
        </div>

        {/* Financial Snapshot */}
        <div style={cardStyle} data-sr="fade-up" data-sr-delay="100">
          <div style={cardHeaderStyle}>
            <span style={{ fontSize: "1.1rem" }}>💰</span>
            <h3 style={cardTitleStyle}>Financial Snapshot</h3>
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Total Fee", value: summary.totalFee ? `₹ ${summary.totalFee}` : "TBA" },
              { label: "Paid to Date", value: summary.totalPaid ? `₹ ${summary.totalPaid}` : "₹ 0" },
            ].map((row) => (
              <div
                key={row.label}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.875rem", background: "#f8fafc", borderRadius: "0.625rem", border: "1px solid #e2e8f0" }}
              >
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{row.label}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" }}>{row.value}</span>
              </div>
            ))}
            {/* Balance row with color coding */}
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.875rem", background: balanceBg, borderRadius: "0.625rem", border: `1px solid ${balanceBorder}` }}
            >
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Balance Due</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: balanceColor }}>
                {summary.totalFee ? `₹ ${summary.balance}` : "TBA"}
              </span>
            </div>
            {/* Payment status chip */}
            <div
              style={{ textAlign: "center", padding: "0.5rem", borderRadius: "0.625rem", background: summary.balance > 0 ? "#fff7ed" : "#f0fdf4", border: `1px solid ${balanceBorder}`, fontSize: "0.78rem", fontWeight: 700, color: balanceColor }}
            >
              {summary.totalFee === 0 ? "⏳ Awaiting fee schedule" : summary.balance > 0 ? "⚠️ Pending balance" : "✅ All clear — fully paid"}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Upcoming Sessions + Profile & Support */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>

        {/* Upcoming Sessions */}
        <div style={cardStyle} data-sr="fade-up" data-sr-delay="200">
          <div style={cardHeaderStyle}>
            <span style={{ fontSize: "1.1rem" }}>📅</span>
            <h3 style={cardTitleStyle}>Upcoming Sessions</h3>
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {loading && (
              <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Loading schedule…</p>
            )}
            {!loading && summary.upcomingSessions.length === 0 && (
              <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: "#94a3b8" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
                <p style={{ fontSize: "0.82rem" }}>No upcoming sessions yet. Check with your mentor.</p>
              </div>
            )}
            {summary.upcomingSessions.map((session, i) => (
              <div key={`${session.courseTitle}-${session.classDate}`}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const key = `${session.courseTitle}-${session.classDate}-${i}`;
                    setExpandedSessionKey((prev) => (prev === key ? null : key));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const key = `${session.courseTitle}-${session.classDate}-${i}`;
                      setExpandedSessionKey((prev) => (prev === key ? null : key));
                    }
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 0.875rem",
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: "0.75rem",
                    gap: "0.75rem",
                    cursor: "pointer",
                    animation: `fadeUp 0.3s ${i * 0.05}s ease both`,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.courseTitle}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "#78716c", margin: "2px 0 0" }}>
                      {session.numberOfClasses ? `${session.numberOfClasses} class(es)` : "Session"}
                    </p>
                  </div>
                  <span
                    style={{
                      flexShrink: 0,
                      background: "linear-gradient(135deg, #f97316, #fb923c)",
                      color: "#fff",
                      borderRadius: "999px",
                      padding: "0.2rem 0.625rem",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {session.label}
                  </span>
                </div>

                {expandedSessionKey === `${session.courseTitle}-${session.classDate}-${i}` && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.65rem 0.75rem",
                      background: "#ffffff",
                      border: "1px solid #fed7aa",
                      borderRadius: "0.65rem",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    {Array.isArray(session.timeSlots) && session.timeSlots.length > 0 ? (
                      session.timeSlots.map((slot, idx) => (
                        <span
                          key={`${session.classDate}-${slot}-${idx}`}
                          style={{
                            background: "#ffedd5",
                            color: "#9a3412",
                            border: "1px solid #fdba74",
                            borderRadius: "999px",
                            padding: "0.2rem 0.6rem",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                          }}
                        >
                          {formatTime(slot)}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        Time TBA
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payments */}
        <div style={cardStyle} data-sr="fade-up" data-sr-delay="240">
          <div style={cardHeaderStyle}>
            <span style={{ fontSize: "1.1rem" }}>💳</span>
            <h3 style={cardTitleStyle}>Pending Payments</h3>
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {pendingFees.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.25rem 1rem", color: "#94a3b8" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "0.35rem" }}>✅</div>
                <p style={{ fontSize: "0.82rem" }}>No pending payments right now.</p>
              </div>
            ) : (
              pendingFees.slice(0, 4).map((item, idx) => (
                <div
                  key={`${item.classId}-${item.feeMonth}-${idx}`}
                  style={{
                    border: "1px solid #fed7aa",
                    background: "#fff7ed",
                    borderRadius: "0.75rem",
                    padding: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.classTitle}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#9a3412" }}>
                        {item.feeMonthLabel} · Balance ₹ {item.balanceDue || 0}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-xs font-semibold"
                      onClick={() => openPaymentDialog(item)}
                      disabled={item.awaitingApproval}
                    >
                      {item.awaitingApproval ? "Awaiting Approval" : "Pay Now"}
                    </Button>
                  </div>
                </div>
              ))
            )}
            {pendingFees.length > 4 && (
              <p style={{ fontSize: "0.72rem", color: "#9a3412" }}>
                Showing 4 of {pendingFees.length} pending items.
              </p>
            )}
          </div>
        </div>

        {/* Profile & Support */}
        <div style={cardStyle} data-sr="fade-up" data-sr-delay="300">
          <div style={cardHeaderStyle}>
            <span style={{ fontSize: "1.1rem" }}>👤</span>
            <h3 style={cardTitleStyle}>Profile & Support</h3>
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {/* Profile completion */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Profile Completion</span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#fff",
                    background: profileCompletion === 100 ? "#16a34a" : "#f97316",
                    padding: "0.1rem 0.5rem",
                    borderRadius: "999px",
                  }}
                >
                  {profileCompletion}%
                </span>
              </div>
              <div style={{ height: "8px", width: "100%", borderRadius: "999px", background: "#f1f5f9", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: "999px",
                    background: profileCompletion === 100
                      ? "linear-gradient(90deg, #16a34a, #4ade80)"
                      : "linear-gradient(90deg, #f97316, #fbbf24)",
                    width: `${profileCompletion}%`,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.375rem" }}>
                Keep your details updated for smooth enrollments.
              </p>
            </div>

            {/* Support info */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.75rem",
                padding: "0.75rem 0.875rem",
              }}
            >
              <p style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", fontWeight: 700, marginBottom: "0.4rem" }}>
                Support
              </p>
              <p style={{ fontSize: "0.82rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                <span>📞</span> +91 9999466159
              </p>
              <p style={{ fontSize: "0.82rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.4rem", wordBreak: "break-all" }}>
                <span>✉️</span> mentor.languageclasses@gmail.com
              </p>
            </div>

            {/* Quick links */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[
                { href: "#courses", label: "Browse Courses" },
                { href: "#enrolledcourse", label: "My Courses" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "999px",
                    border: "1.5px solid #fed7aa",
                    background: "#fff",
                    color: "#c2410c",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fff7ed"; e.currentTarget.style.borderColor = "#f97316"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#fed7aa"; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent style={{ maxWidth: "min(95vw, 720px)" }}>
          <DialogHeader>
            <DialogTitle>Pay Pending Fee</DialogTitle>
            <DialogDescription>
              Submit payment details for{" "}
              <strong>{selectedPayment?.classTitle || "your course"}</strong>.
            </DialogDescription>
          </DialogHeader>

          {paymentMessage && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
              {paymentMessage}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4 text-center">
              <img
                src={paymentQr}
                alt="Payment QR Code"
                className="mx-auto mb-3 w-40 rounded-lg border border-orange-200 bg-white p-1"
              />
              <p className="text-xs font-semibold text-orange-700">Scan QR to Pay</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Balance: ₹ {selectedPayment?.balanceDue || 0}
              </p>
            </div>

            <form className="space-y-3" onSubmit={submitPayment}>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Payment Method
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  value={paymentForm.paymentMethod}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
                  }
                >
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={paymentForm.transactionId}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, transactionId: e.target.value }))
                    }
                  />
                  {paymentErrors.transactionId && (
                    <p className="mt-1 text-[11px] text-rose-600">
                      {paymentErrors.transactionId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                  />
                  {paymentErrors.amount && (
                    <p className="mt-1 text-[11px] text-rose-600">
                      {paymentErrors.amount}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Paid On
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={paymentForm.paidOn}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, paidOn: e.target.value }))
                    }
                  />
                  {paymentErrors.paidOn && (
                    <p className="mt-1 text-[11px] text-rose-600">
                      {paymentErrors.paidOn}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Payer Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={paymentForm.payerName}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, payerName: e.target.value }))
                    }
                  />
                  {paymentErrors.payerName && (
                    <p className="mt-1 text-[11px] text-rose-600">
                      {paymentErrors.payerName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={paymentForm.phone}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                  {paymentErrors.phone && (
                    <p className="mt-1 text-[11px] text-rose-600">
                      {paymentErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Screenshot (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 w-full text-xs"
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        screenshot: e.target.files?.[0] || null,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={paymentSubmitting}>
                  {paymentSubmitting ? "Submitting..." : "Submit Payment"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default StudentOverview;
