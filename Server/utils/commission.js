import Attendance from "../Models/Attendance.js";
import Classes from "../Models/Classes.js";
import ClassTeachers from "../Models/ClassTeachers.js";
import Commission from "../Models/Commission.js";

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
  const classDoc = await Classes.findById(classId).select("classTitle");

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

  const rate = Number.isFinite(Number(assignment.commissionRate))
    ? Number(assignment.commissionRate)
    : Number(process.env.DEFAULT_COMMISSION_RATE || 1);

  const attendanceDocs = await Attendance.find({ classId }).select(
    "detailAttendance"
  );

  const totalsByMonth = new Map();

  for (const attendance of attendanceDocs) {
    for (const detail of attendance.detailAttendance || []) {
      if (teacherId && String(detail.teacherId) !== String(teacherId)) continue;
      const parsed = parseClassDate(detail.classDate);
      if (!parsed) continue;

      const units = Number(detail.numberOfClassesTaken || 0);
      if (!Number.isFinite(units) || units <= 0) continue;

      const key = `${parsed.monthName}|${parsed.year}`;
      totalsByMonth.set(key, (totalsByMonth.get(key) || 0) + units);
    }
  }

  const commissions = [];

  for (const [key, totalUnits] of totalsByMonth.entries()) {
    const [monthName, year] = key.split("|");
    const commissionAmount = Number((totalUnits * rate).toFixed(2));

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
          commission: commissionAmount,
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
