import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../api/useApi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import paymentQr from "../../../assets/QR.jpeg";
import {
  normalizeDigits,
  validateNumber,
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

const formatDate = (value) => {
  if (!value) return "TBA";
  const parts = parseClassDateParts(value);
  const date = toDateFromParts(parts);
  if (!date) return "TBA";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getScheduleSummary = (course) => {
  const entries = course?.dailyClasses || [];
  const totalSessions = entries.reduce(
    (total, entry) => total + toNumber(entry.numberOfClasses),
    0
  );
  const upcoming = entries
    .map((entry) => {
      const date = toDateFromParts(parseClassDateParts(entry.classDate));
      if (!date) return null;
      return { ...entry, date };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date)
    .slice(0, 3)
    .map((entry) => ({
      label: formatDate(entry.classDate),
      count: entry.numberOfClasses,
    }));

  return { totalSessions, upcoming };
};

const getMentorNames = (course) =>
  (course?.teachers || [])
    .map((teacher) => teacher?.teacherId?.name)
    .filter(Boolean)
    .join(", ");

const LanguageCourses = () => {
  const navigate = useNavigate();
  const { get, post } = useApi();
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupEnroll, setShowPopupEnroll] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState({});
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

  const buildPaymentErrors = (nextForm) => {
    const hasPaymentDetails = Boolean(
      nextForm.transactionId ||
        nextForm.amount ||
        nextForm.paidOn ||
        nextForm.payerName ||
        nextForm.phone ||
        nextForm.screenshot
    );
    if (!hasPaymentDetails) {
      return {};
    }
    return {
      transactionId: validateRequired(nextForm.transactionId, "Transaction ID"),
      amount: validateNumber(nextForm.amount, { min: 1, label: "Amount" }),
      paidOn: validateRequired(nextForm.paidOn, "Paid on date"),
      payerName: validateRequired(nextForm.payerName, "Payer name"),
      phone: validatePhone(nextForm.phone),
    };
  };

  const updatePaymentField = (name, value) => {
    setPaymentForm((prev) => {
      const next = { ...prev, [name]: value };
      setPaymentErrors(buildPaymentErrors(next));
      return next;
    });
  };

  const handleEnrollClose = () => {
    setShowPopupEnroll(false);
  };

  const handleEnrollClick = (courseId) => {
    setSelectedCourseId(courseId);
    setShowPopup(true);
    setPopupMessage(null);
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
  };

  const settings = {
    centerMode: true,
    centerPadding: "60px",
    slidesToShow: 5,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 1,
        },
      },
    ],
  };

  const [Eachcourse, setEachCourse] = useState(null);
  useEffect(() => {
    const fetchEachCourse = async () => {
      try {
        if (selectedCourseId) {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("No token found");
            navigate("/login");
            return;
          }
          const response = await get({
            url: `/students/all-courses/${selectedCourseId}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).unwrap();
          if (response.status === 200) {
            setEachCourse(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchEachCourse();
  }, [selectedCourseId]);

  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    const fetchAllcourses = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await get({
          url: "/students/all-courses",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status == 200) {
          setAllCourses(response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchAllcourses();
  }, []);

  const canViewSchedule = Boolean(Eachcourse?.isEnrolled);
  const scheduleSummary = canViewSchedule ? getScheduleSummary(Eachcourse) : { totalSessions: 0, upcoming: [] };
  const mentorNames = getMentorNames(Eachcourse);

  const handleApplyCourse = async (courseId) => {
    try {
      setPopupMessage(null);
      setSubmitting(true);

      const hasPaymentDetails = Boolean(
        paymentForm.transactionId ||
          paymentForm.amount ||
          paymentForm.paidOn ||
          paymentForm.payerName ||
          paymentForm.phone ||
          paymentForm.screenshot
      );

      const nextErrors = buildPaymentErrors(paymentForm);
      setPaymentErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) {
        setPopupMessage("Please fix the highlighted payment fields.");
        setSubmitting(false);
        return;
      }

      if (hasPaymentDetails) {
        if (
          !paymentForm.transactionId ||
          !paymentForm.amount ||
          !paymentForm.paidOn ||
          !paymentForm.payerName ||
          !paymentForm.phone
        ) {
          setPopupMessage("Complete all payment fields or leave them blank to submit without payment.");
          setSubmitting(false);
          return;
        }
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const formData = new FormData();
      if (hasPaymentDetails) {
        formData.append("paymentMethod", paymentForm.paymentMethod);
        formData.append("transactionId", paymentForm.transactionId);
        formData.append("amount", paymentForm.amount);
        formData.append("paidOn", paymentForm.paidOn);
        formData.append("payerName", paymentForm.payerName);
        formData.append("phone", paymentForm.phone);
        if (paymentForm.screenshot) {
          formData.append("screenshot", paymentForm.screenshot);
        }
      }
      if (paymentForm.notes) {
        formData.append("notes", paymentForm.notes);
      }

      const response = await post({
        url: `/students/payment-requests/${courseId}`,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 201) {
        setShowPopup(false);
        setShowPopupEnroll(true);
        setSelectedCourseId(null);
      } else {
        console.log("some errors occurred");
      }
    } catch (error) {
      console.error("Error applying in course:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          setPopupMessage("You already submitted a request for this course.");
          setShowPopup(false);
        } else if (status === 408) {
          setPopupMessage("You Are Already Enrolled In This Course!!!");
          setShowPopup(false);
        } else if (status === 400) {
          setPopupMessage("Complete all payment fields or leave them blank to submit without payment.");
          setShowPopup(false);
        } else if (status === 403) {
          setPopupMessage("You are not eligible to enroll in this course.");
          setShowPopup(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const CourseCard = ({ course }) => {
    const isEnrolled = Boolean(course?.isEnrolled);
    const schedule = isEnrolled ? getScheduleSummary(course) : { totalSessions: 0, upcoming: [] };
    const scheduleLabel = course.classSchedule?.trim() || "Flexible / TBA";
    const nextSession = isEnrolled ? (schedule.upcoming?.[0]?.label || "TBA") : "Enroll to view";
    const sessionCountLabel = isEnrolled
      ? schedule.totalSessions
        ? `${schedule.totalSessions} sessions`
        : "TBA"
      : "Enroll to view";

    return (
      <Card className="group relative flex h-full min-h-[16rem] flex-col overflow-hidden rounded-xl border border-orange-100/70 bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-200" />
        <CardHeader className="relative z-10 pb-2 pt-4 px-4 sm:px-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              {course.grade || "General"}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {sessionCountLabel}
            </span>
          </div>
          <CardTitle className="course-title text-sm font-semibold leading-tight text-slate-900 sm:text-base line-clamp-2 group-hover:text-orange-600 transition-colors">
            {course.classTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 mt-auto flex flex-col gap-3 pb-4 px-4 sm:px-5">
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-[11px]">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wide text-slate-400">Duration</span>
              <span className="font-semibold text-slate-700">{course.totalHours || "--"} hrs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wide text-slate-400">Schedule</span>
              <span className="font-semibold text-slate-700 line-clamp-1">{scheduleLabel}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wide text-slate-400">Next</span>
              <span className="font-semibold text-slate-700">{nextSession}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Branch: {course.branch || "Main"}</span>
            <span>Added: {formatDate(course.createdAt)}</span>
          </div>
          <Button
            size="sm"
            className="h-9 w-full bg-orange-500 hover:bg-orange-600 shadow-sm rounded-lg text-xs font-semibold tracking-wide"
            onClick={() => handleEnrollClick(course._id)}
          >
            Explore Plan
            <svg
              className="ml-1.5 h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <section className="mt-8" id="courses">
        <Card className="border-orange-100/80 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Available Programs</CardTitle>
            <CardDescription>Browse current course offerings and apply instantly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="slider-container py-8">
              {allCourses.length > 3 ? (
                <Slider {...settings}>
                  {allCourses.map((course) => (
                    <div key={course._id} className="px-2 h-full">
                      <CourseCard course={course} />
                    </div>
                  ))}
                </Slider>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
                  {allCourses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent
          style={{
            maxWidth: "min(95vw, 680px)",
            padding: 0,
            borderRadius: "1.25rem",
            overflow: "hidden",
            border: "none",
            boxShadow: "0 25px 60px -10px rgba(0,0,0,0.18), 0 10px 30px -5px rgba(0,0,0,0.1)",
          }}
        >
          {/* ── Header banner ── */}
          <div
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)",
              padding: "1.25rem 1.5rem 1rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* decorative blobs */}
            <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", bottom: "-20px", left: "60px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.2)", padding: "2px 10px", borderRadius: "999px" }}>
                Course Enrollment
              </span>
              <h2 style={{ marginTop: "0.5rem", fontSize: "clamp(1rem,3.5vw,1.35rem)", fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>
                {Eachcourse?.classTitle || "Loading…"}
              </h2>
              <p style={{ marginTop: "0.25rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.85)" }}>
                Review details and complete payment to enroll
              </p>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ maxHeight: "calc(95dvh - 120px)", overflowY: "auto", overscrollBehavior: "contain", background: "#fafafa" }}>

            {/* ── Course stats strip ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.75rem", padding: "1.25rem 1.5rem 0" }}>
              {[
                { icon: "🎓", label: "Grade", value: Eachcourse?.grade || "All levels" },
                { icon: "⏱️", label: "Duration", value: Eachcourse?.totalHours ? `${Eachcourse.totalHours} hrs` : "TBA" },
                { icon: "📅", label: "Sessions", value: canViewSchedule ? (scheduleSummary.totalSessions || "TBA") : "Enroll to view" },
                { icon: "🏫", label: "Branch", value: Eachcourse?.branch || "Main" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: "0.875rem", padding: "0.75rem 0.875rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{stat.icon}</span>
                  <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "#9ca3af", fontWeight: 600 }}>{stat.label}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* ── Mentor + Schedule ── */}
            <div style={{ padding: "1rem 1.5rem 0", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {mentorNames && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>👨‍🏫</span>
                  <div>
                    <p style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "#9ca3af", fontWeight: 600 }}>Mentors</p>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginTop: "1px" }}>{mentorNames}</p>
                  </div>
                </div>
              )}

              {!canViewSchedule && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.875rem 1rem", fontSize: "0.8rem", color: "#64748b" }}>
                  Enroll to view scheduled session dates and timings.
                </div>
              )}

              {canViewSchedule && scheduleSummary.upcoming.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.875rem 1rem" }}>
                  <p style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "#9ca3af", fontWeight: 600, marginBottom: "0.5rem" }}>📆 Upcoming Sessions</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {scheduleSummary.upcoming.map((entry, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#475569", background: "#f8fafc", borderRadius: "0.5rem", padding: "0.4rem 0.75rem" }}>
                        <span>{entry.label}</span>
                        <span style={{ fontWeight: 700, color: "#f97316" }}>{entry.count ? `${entry.count} class(es)` : "Session"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Divider ── */}
            <div style={{ margin: "1.25rem 1.5rem 0", borderTop: "2px dashed #fed7aa" }} />

            {/* ── Payment section ── */}
            <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>💳</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>Payment Details (Optional)</h3>
                <span style={{ fontSize: "0.65rem", color: "#9ca3af", background: "#f1f5f9", padding: "2px 8px", borderRadius: "999px", marginLeft: "auto" }}>Payment optional</span>
              </div>

              {/* QR + form wrapper */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* QR card */}
                <div style={{ background: "linear-gradient(135deg,#fff7ed,#fff)", border: "1.5px solid #fed7aa", borderRadius: "1rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                  <img
                    src={paymentQr}
                    alt="Payment QR Code"
                    onClick={() => setShowQrPreview(true)}
                    style={{ width: "88px", height: "88px", flexShrink: 0, borderRadius: "0.625rem", border: "1px solid #fed7aa", background: "#fff", objectFit: "contain", padding: "6px", cursor: "pointer" }}
                  />
                  <div>
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#c2410c" }}>Scan QR to Pay</p>
                    <p style={{ fontSize: "0.73rem", color: "#78716c", marginTop: "0.25rem", lineHeight: 1.5 }}>
                      If you have already paid via UPI, fill in the details below and upload your screenshot. Otherwise you can submit without payment.
                    </p>
                    <div style={{ marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "4px", background: "#fef3c7", borderRadius: "999px", padding: "2px 10px", fontSize: "0.65rem", color: "#92400e", fontWeight: 600 }}>
                      ⚠️ Pay now or submit without payment
                    </div>
                  </div>
                </div>

                {/* Form grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.875rem" }}>
                  {/* Payment Method */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Payment Method (UPI only)</label>
                    <input
                      value={paymentForm.paymentMethod}
                      readOnly
                      style={{ width: "100%", borderRadius: "0.625rem", border: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "#1e293b", outline: "none" }}
                    />
                  </div>

                  {/* Transaction ID */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Transaction / UTR ID <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        value={paymentForm.transactionId}
                        onChange={(e) => updatePaymentField("transactionId", e.target.value)}
                        placeholder="e.g. 4234XXXXXXXX"
                        style={{ width: "100%", borderRadius: "0.625rem", border: "1.5px solid #e2e8f0", background: "#fff", padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "#1e293b", outline: "none", transition: "border-color .15s" }}
                        onFocus={e => e.target.style.borderColor = "#f97316"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                      {paymentErrors.transactionId && (
                        <span style={{ fontSize: "0.7rem", color: "#e11d48" }}>
                          {paymentErrors.transactionId}
                        </span>
                      )}
                    </div>

                  {/* Amount */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Amount Paid (₹) <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="number"
                        min="0"
                        value={paymentForm.amount}
                        onChange={(e) => updatePaymentField("amount", e.target.value)}
                        placeholder="0"
                        style={{ width: "100%", borderRadius: "0.625rem", border: "1.5px solid #e2e8f0", background: "#fff", padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "#1e293b", outline: "none", transition: "border-color .15s" }}
                        onFocus={e => e.target.style.borderColor = "#f97316"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                      {paymentErrors.amount && (
                        <span style={{ fontSize: "0.7rem", color: "#e11d48" }}>
                          {paymentErrors.amount}
                        </span>
                      )}
                    </div>

                  {/* Paid On */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Paid On <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="date"
                        value={paymentForm.paidOn}
                        onChange={(e) => updatePaymentField("paidOn", e.target.value)}
                        style={{ width: "100%", borderRadius: "0.625rem", border: "1.5px solid #e2e8f0", background: "#fff", padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "#1e293b", outline: "none", transition: "border-color .15s" }}
                        onFocus={e => e.target.style.borderColor = "#f97316"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                      {paymentErrors.paidOn && (
                        <span style={{ fontSize: "0.7rem", color: "#e11d48" }}>
                          {paymentErrors.paidOn}
                        </span>
                      )}
                    </div>

                  {/* Payer Name */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Payer Name <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        value={paymentForm.payerName}
                        onChange={(e) => updatePaymentField("payerName", e.target.value)}
                        placeholder="Full name"
                        style={{ width: "100%", borderRadius: "0.625rem", border: "1.5px solid #e2e8f0", background: "#fff", padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "#1e293b", outline: "none", transition: "border-color .15s" }}
                        onFocus={e => e.target.style.borderColor = "#f97316"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                      {paymentErrors.payerName && (
                        <span style={{ fontSize: "0.7rem", color: "#e11d48" }}>
                          {paymentErrors.payerName}
                        </span>
                      )}
                    </div>

                  {/* Phone */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        value={paymentForm.phone}
                        onChange={(e) =>
                          updatePaymentField(
                            "phone",
                            normalizeDigits(e.target.value).slice(0, 10)
                          )
                        }
                        placeholder="XXXXXXXXXX"
                        style={{ width: "100%", borderRadius: "0.625rem", border: "1.5px solid #e2e8f0", background: "#fff", padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "#1e293b", outline: "none", transition: "border-color .15s" }}
                        onFocus={e => e.target.style.borderColor = "#f97316"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        inputMode="numeric"
                        maxLength={10}
                      />
                      {paymentErrors.phone && (
                        <span style={{ fontSize: "0.7rem", color: "#e11d48" }}>
                          {paymentErrors.phone}
                        </span>
                      )}
                    </div>

                  {/* Notes — full width */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Notes <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
                    <textarea
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional info for the admin…"
                      rows={2}
                      style={{ width: "100%", borderRadius: "0.625rem", border: "1.5px solid #e2e8f0", background: "#fff", padding: "0.55rem 0.75rem", fontSize: "0.85rem", color: "#1e293b", outline: "none", resize: "vertical", fontFamily: "inherit", transition: "border-color .15s" }}
                      onFocus={e => e.target.style.borderColor = "#f97316"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </div>

                  {/* Screenshot — full width */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Payment Screenshot <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
                    <label
                      style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", borderRadius: "0.625rem", border: "1.5px dashed #fed7aa", background: "#fff7ed", padding: "0.65rem 0.875rem", cursor: "pointer", transition: "border-color .15s, background .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.background = "#fff1e6"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#fed7aa"; e.currentTarget.style.background = "#fff7ed"; }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>📎</span>
                      <span style={{ fontSize: "0.8rem", color: "#c2410c", fontWeight: 600 }}>
                        {paymentForm.screenshot ? paymentForm.screenshot.name : "Click to upload screenshot"}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) =>
                          updatePaymentField("screenshot", e.target.files?.[0] || null)
                        }
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>

                {/* Error message */}
                {popupMessage && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.625rem", padding: "0.6rem 0.875rem", fontSize: "0.82rem", color: "#b91c1c", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    ⚠️ {popupMessage}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={() => handleApplyCourse(selectedCourseId)}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem",
                    borderRadius: "0.875rem",
                    background: submitting ? "#fdba74" : "linear-gradient(135deg,#f97316,#fb923c)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                    transition: "all .2s",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(249,115,22,0.45)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(249,115,22,0.35)"; }}
                >
                  {submitting ? "⏳ Submitting…" : "✅ Submit Enrollment Request"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPopupEnroll} onOpenChange={setShowPopupEnroll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request submitted!</DialogTitle>
            <DialogDescription>
              We have received your payment details. Admin will verify and enroll you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={handleEnrollClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showQrPreview} onOpenChange={setShowQrPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR to Pay</DialogTitle>
            <DialogDescription>Open this QR in full size to scan clearly.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={paymentQr}
              alt="Payment QR Code"
              style={{ width: "320px", height: "320px", objectFit: "contain" }}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowQrPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(popupMessage)}
        onOpenChange={(open) => {
          if (!open) setPopupMessage(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Heads up</DialogTitle>
            <DialogDescription className="text-sm">{popupMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setPopupMessage(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .slick-prev,
        .slick-next {
          width: 42px;
          height: 42px;
          background-color: rgb(249 115 22);
          border: 1px solid rgb(249 115 22);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          z-index: 1;
        }

        .slick-prev:hover,
        .slick-next:hover {
          background-color: rgb(249 115 22);
        }

        .slick-prev {
          left: 0px;
        }

        .slick-next {
          right: 0px;
        }
      `}</style>
    </>
  );
};

export default LanguageCourses;


