import Attendance from "../Models/Attendance.js";
import Classes from "../Models/Classes.js";
import ClassTeachers from "../Models/ClassTeachers.js";
import Commission from "../Models/Commission.js";
import { normalizeAttendanceMode } from "./attendanceMode.js";
import { resolveCommissionRate } from "./classTeachers.js";

const MONTH_NAMES = [
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

const parseClassDate = (dateStr = "") => {
  const parts = String(dateStr).split("-").map((part) => part.trim());
  if (parts.length < 3) return null;

  let yearPart = "";
  let monthPart = "";

  if (parts[0].length === 4) {
    yearPart = parts[0];
    monthPart = parts[1];
  } else {
    yearPart = parts[2];
    monthPart = parts[1];
  }

  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }

  return {
    year,
    month,
    monthName: MONTH_NAMES[month - 1],
  };
};

const calculateMonthlyCommission = async (classId, teacherId) => {
  const classDoc = await Classes.findById(classId).select(
    "classTitle dailyClasses"
  );

  if (!classDoc) {
    return { classDoc: null, commissions: [] };
  }

  const assignment = await ClassTeachers.findOne({
    classId,
    teacherId,
    active: true,
  });
  if (!assignment) {
    return { classDoc, commissions: [] };
  }

  const offlineRate = resolveCommissionRate(assignment, "offline");
  const onlineRate = resolveCommissionRate(assignment, "online");

  const totalsByMonth = new Map();
  const sessions = (classDoc.dailyClasses || []).filter((entry) => {
    if (!entry?.classDate) return false;
    if (teacherId && entry.teacherId) {
      return String(entry.teacherId) === String(teacherId);
    }
    return true;
  });

  const hasHeldFlag = sessions.some(
    (entry) => typeof entry.isHeld === "boolean"
  );
  const heldSessions = hasHeldFlag
    ? sessions.filter((entry) => entry.isHeld === true)
    : sessions;

  if (heldSessions.length > 0) {
    const sessionMax = new Map();
    for (const session of heldSessions) {
      const mode = normalizeAttendanceMode(session.mode) || "offline";
      const key = `${session.classDate}|${mode}`;
      const units = Number(session.numberOfClasses || 0);
      if (!Number.isFinite(units) || units <= 0) continue;
      const existing = sessionMax.get(key) || 0;
      if (units > existing) {
        sessionMax.set(key, units);
      }
    }

    for (const [key, units] of sessionMax.entries()) {
      const [classDate, mode] = key.split("|");
      const parsed = parseClassDate(classDate);
      if (!parsed) continue;
      const monthKey = `${parsed.monthName}|${parsed.year}`;
      const bucket = totalsByMonth.get(monthKey) || {
        offlineUnits: 0,
        onlineUnits: 0,
      };
      if (mode === "online") {
        bucket.onlineUnits += units;
      } else {
        bucket.offlineUnits += units;
      }
      totalsByMonth.set(monthKey, bucket);
    }
  } else {
    const attendanceDocs = await Attendance.find({ classId }).select(
      "detailAttendance"
    );
    const sessionMax = new Map();

    for (const attendance of attendanceDocs) {
      for (const detail of attendance.detailAttendance || []) {
        if (teacherId && String(detail.teacherId) !== String(teacherId)) continue;
        const parsed = parseClassDate(detail.classDate);
        if (!parsed) continue;

        const units = Number(detail.numberOfClassesTaken || 0);
        if (!Number.isFinite(units) || units <= 0) continue;

        const mode = normalizeAttendanceMode(detail.mode) || "offline";
        const key = `${detail.classDate}|${mode}`;
        const existing = sessionMax.get(key) || 0;
        if (units > existing) {
          sessionMax.set(key, units);
        }
      }
    }

    for (const [key, units] of sessionMax.entries()) {
      const [classDate, mode] = key.split("|");
      const parsed = parseClassDate(classDate);
      if (!parsed) continue;
      const monthKey = `${parsed.monthName}|${parsed.year}`;
      const bucket = totalsByMonth.get(monthKey) || {
        offlineUnits: 0,
        onlineUnits: 0,
      };
      if (mode === "online") {
        bucket.onlineUnits += units;
      } else {
        bucket.offlineUnits += units;
      }
      totalsByMonth.set(monthKey, bucket);
    }
  }

  const commissions = [];

  for (const [key, totals] of totalsByMonth.entries()) {
    const [monthName, year] = key.split("|");
    const offlineUnits = Number(totals?.offlineUnits || 0);
    const onlineUnits = Number(totals?.onlineUnits || 0);
    const totalUnits = offlineUnits + onlineUnits;
    const offlineCommission = Number((offlineUnits * offlineRate).toFixed(2));
    const onlineCommission = Number((onlineUnits * onlineRate).toFixed(2));
    const commissionAmount = Number((offlineCommission + onlineCommission).toFixed(2));

    const doc = await Commission.findOneAndUpdate(
      {
        teacherId,
        classId,
        monthName,
        year: String(year),
      },
      {
        $set: {
          classesTaken: String(totalUnits),
          offlineClassesTaken: String(offlineUnits),
          onlineClassesTaken: String(onlineUnits),
          commission: commissionAmount,
          offlineCommission,
          onlineCommission,
        },
        $setOnInsert: {
          paid: null,
          remarks: "",
        },
      },
      { new: true, upsert: true }
    );

    commissions.push(doc);
  }

  return { classDoc, commissions };
};

const sortCommissions = (items = []) => {
  const monthIndex = (name) => MONTH_NAMES.indexOf(name);
  return [...items].sort((a, b) => {
    const yearDiff = Number(a.year) - Number(b.year);
    if (yearDiff !== 0) return yearDiff;
    return monthIndex(a.monthName) - monthIndex(b.monthName);
  });
};

export { calculateMonthlyCommission, parseClassDate, sortCommissions };
