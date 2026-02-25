import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../../../api/useApi";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value) => {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getProfileCompletion = (student) => {
  if (!student) return 0;
  const fields = ["name", "email", "phone", "grade", "dob", "userName"];
  const completed = fields.filter((key) => Boolean(student?.[key])).length;
  return Math.round((completed / fields.length) * 100);
};

const StudentOverview = ({ student }) => {
  const { get } = useApi();
  const [loading, setLoading] = useState(false);
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

  const profileCompletion = useMemo(
    () => getProfileCompletion(student),
    [student]
  );

  useEffect(() => {
    const classIds = student?.classes || [];
    const appliedCount = student?.appliedClasses?.length || 0;

    if (!student) {
      return;
    }

    if (classIds.length === 0) {
      setSummary((prev) => ({
        ...prev,
        enrolledCount: 0,
        appliedCount,
      }));
      return;
    }

    const fetchSummary = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const courseResults = await Promise.allSettled(
          classIds.map((classId) =>
            get({
              url: `/students/all-courses/${classId}`,
              headers,
            }).unwrap()
          )
        );

        const courses = courseResults
          .filter(
            (result) =>
              result.status === "fulfilled" &&
              result.value.status === 200 &&
              result.value.data
          )
          .map((result) => result.value.data);

        const attendanceResults = await Promise.allSettled(
          classIds.map((classId) =>
            get({
              url: `/students/my-attendance/${classId}`,
              headers,
            }).unwrap()
          )
        );

        const feeResults = await Promise.allSettled(
          classIds.map((classId) =>
            get({
              url: `/students/my-fee-details/${classId}`,
              headers,
            }).unwrap()
          )
        );

        const scheduleEntries = courses.flatMap((course) =>
          (course?.dailyClasses || []).map((entry) => ({
            ...entry,
            courseTitle: course?.classTitle || "Course",
          }))
        );

        const scheduleDates = scheduleEntries
          .map((entry) => {
            const dateValue = new Date(entry.classDate);
            if (Number.isNaN(dateValue.getTime())) return null;
            return { ...entry, dateValue };
          })
          .filter(Boolean);

        const today = new Date();
        const todayStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        const upcomingSessions = scheduleDates
          .filter((entry) => entry.dateValue >= todayStart)
          .sort((a, b) => a.dateValue - b.dateValue)
          .slice(0, 3)
          .map((entry) => ({
            ...entry,
            label: formatDate(entry.classDate),
          }));

        const totalScheduled = scheduleEntries.reduce(
          (total, entry) => total + toNumber(entry.numberOfClasses),
          0
        );

        const totalHours = courses.reduce(
          (total, course) => total + toNumber(course.totalHours),
          0
        );

        const totalAttended = attendanceResults.reduce((total, result) => {
          if (result.status !== "fulfilled") return total;
          const data = result.value?.data;
          if (!data) return total;
          if (data.totalClassesTaken) {
            return total + toNumber(data.totalClassesTaken);
          }
          const detailTotal = (data.detailAttendance || []).reduce(
            (sum, row) => sum + toNumber(row.numberOfClassesTaken),
            0
          );
          return total + detailTotal;
        }, 0);

        const totalFee = feeResults.reduce((total, result) => {
          if (result.status !== "fulfilled") return total;
          return total + toNumber(result.value?.data?.totalFee);
        }, 0);

        const totalPaid = feeResults.reduce((total, result) => {
          if (result.status !== "fulfilled") return total;
          const detailFee = result.value?.data?.detailFee || [];
          return (
            total +
            detailFee.reduce(
              (sum, fee) => sum + toNumber(fee.amountPaid),
              0
            )
          );
        }, 0);

        const balance = Math.max(0, totalFee - totalPaid);

        setSummary({
          enrolledCount: classIds.length,
          appliedCount,
          totalHours,
          totalScheduled,
          totalAttended,
          totalFee,
          totalPaid,
          balance,
          upcomingSessions,
        });
      } catch (error) {
        console.error("Error building student summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [student]);

  return (
    <section className="mt-8 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-orange-100/80 bg-white/90 shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg">Learning Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:gap-4">
              <div className="rounded-xl border border-border bg-white/70 p-2 sm:p-3">
                <p className="text-xs uppercase tracking-wide">Enrolled</p>
                <p className="mt-1 text-lg font-semibold text-slate-800 sm:text-xl">
                  {summary.enrolledCount}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white/70 p-2 sm:p-3">
                <p className="text-xs uppercase tracking-wide">Applied</p>
                <p className="mt-1 text-lg font-semibold text-slate-800 sm:text-xl">
                  {summary.appliedCount}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white/70 p-2 sm:p-3">
                <p className="text-xs uppercase tracking-wide">Total Hours</p>
                <p className="mt-1 text-lg font-semibold text-slate-800 sm:text-xl">
                  {summary.totalHours || 0} hrs
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white/70 p-2 sm:p-3">
                <p className="text-xs uppercase tracking-wide">Classes Taken</p>
                <p className="mt-1 text-lg font-semibold text-slate-800 sm:text-xl">
                  {summary.totalAttended || 0}
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              {summary.totalScheduled > 0
                ? `Scheduled sessions: ${summary.totalScheduled}`
                : "Schedule updates will appear once published."}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100/80 bg-white/90 shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg">Financial Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 text-sm text-muted-foreground sm:p-6 sm:pt-0">
            <div className="flex items-center justify-between">
              <span>Total Fee</span>
              <span className="font-semibold text-slate-700">
                {summary.totalFee ? `INR ${summary.totalFee}` : "TBA"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Paid to Date</span>
              <span className="font-semibold text-slate-700">
                {summary.totalPaid ? `INR ${summary.totalPaid}` : "INR 0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Balance</span>
              <span className="font-semibold text-slate-700">
                {summary.totalFee ? `INR ${summary.balance}` : "TBA"}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-white/70 p-2 sm:p-3">
              <p className="text-xs uppercase tracking-wide">Payment Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-800 sm:text-base">
                {summary.totalFee === 0
                  ? "Awaiting fee schedule"
                  : summary.balance > 0
                    ? "Pending balance"
                    : "All clear"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        <Card className="border-orange-100/80 bg-white/90 shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 text-sm text-muted-foreground sm:p-6 sm:pt-0">
            {loading && (
              <p className="text-xs text-muted-foreground">Loading schedule...</p>
            )}
            {!loading && summary.upcomingSessions.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No sessions scheduled yet. Check with your mentor for updates.
              </p>
            )}
            {summary.upcomingSessions.map((session) => (
              <div
                key={`${session.courseTitle}-${session.classDate}`}
                className="flex flex-col gap-2 rounded-xl border border-border bg-white/70 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:p-3"
              >
                <div className="min-w-0">
                  <p className="break-words font-semibold text-slate-800">
                    {session.courseTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.numberOfClasses
                      ? `${session.numberOfClasses} class(es)`
                      : "Session"}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-700 sm:shrink-0">
                  {session.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-orange-100/80 bg-white/90 shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg">Profile & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 text-sm text-muted-foreground sm:p-6 sm:pt-0">
            <div>
              <div className="flex items-center justify-between">
                <span>Profile Completion</span>
                <span className="font-semibold text-slate-700">
                  {profileCompletion}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-orange-100">
                <div
                  className="h-2 rounded-full bg-orange-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Keep your details updated for smooth enrollments and
                communications.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white/70 p-2.5 break-words sm:p-3">
              <p className="text-xs uppercase tracking-wide">Support</p>
              <p className="mt-1 text-xs text-slate-700 break-words sm:text-sm">
                Phone: +91 9999466159
              </p>
              <p className="text-xs text-slate-700 break-words sm:text-sm">
                Email: mentor.languageclasses@gmail.com
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild size="sm" variant="outline" className="h-8 px-3 text-[11px]">
                  <a href="#courses">Browse Courses</a>
                </Button>
                <Button asChild size="sm" variant="outline" className="h-8 px-3 text-[11px]">
                  <a href="#enrolledcourse">My Courses</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </section>
  );
};

export default StudentOverview;
