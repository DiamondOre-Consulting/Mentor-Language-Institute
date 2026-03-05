import cron from "node-cron";
import Classes from "./Models/Classes.js";

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

const toStartOfDay = (parts) => {
  if (!parts) return null;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const isSlotExpired = (dateStr, slot) => {
  if (!slot || !/^\d{2}:\d{2}$/.test(slot)) return false;
  const parts = parseClassDateParts(dateStr);
  if (!parts) return false;
  const [hh, mm] = slot.split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
  const dt = new Date(parts.year, parts.month - 1, parts.day, hh, mm, 0, 0);
  if (Number.isNaN(dt.getTime())) return false;
  return new Date() > dt;
};

const pruneExpiredDailyClasses = (classDoc) => {
  let changed = false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDailyClasses = (classDoc.dailyClasses || []).filter((entry) => {
    const slots = Array.isArray(entry.timeSlots) ? entry.timeSlots : [];
    if (slots.length > 0) {
      const remainingSlots = slots.filter((slot) => !isSlotExpired(entry.classDate, slot));
      if (remainingSlots.length !== slots.length) {
        entry.timeSlots = remainingSlots;
        entry.numberOfClasses = String(remainingSlots.length);
        changed = true;
      }
      return remainingSlots.length > 0;
    }

    const parts = parseClassDateParts(entry.classDate);
    if (!parts) {
      return true;
    }
    const entryDate = toStartOfDay(parts);
    if (entryDate && entryDate < today) {
      changed = true;
      return false;
    }
    return true;
  });

  if (nextDailyClasses.length !== (classDoc.dailyClasses || []).length) {
    classDoc.dailyClasses = nextDailyClasses;
    changed = true;
  }

  return changed;
};

const scheduleCleanup = () => {
  cron.schedule(
    "*/30 * * * *",
    async () => {
    try {
      const classes = await Classes.find({});
      for (const classDoc of classes) {
        const changed = pruneExpiredDailyClasses(classDoc);
        if (changed) {
          await classDoc.save();
        }
      }
    } catch (error) {
      console.error("Schedule cleanup failed:", error);
    }
    },
    {
      timezone: process.env.CRON_TIMEZONE || "Asia/Kolkata",
    }
  );
};

export default scheduleCleanup;
