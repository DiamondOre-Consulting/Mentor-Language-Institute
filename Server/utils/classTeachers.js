import ClassTeachers from "../Models/ClassTeachers.js";
import { normalizeAttendanceMode } from "./attendanceMode.js";

const normalizeCommissionRate = (val) => {
  const num = Number(val);
  if (Number.isFinite(num)) return num;
  return Number(process.env.DEFAULT_COMMISSION_RATE || 1);
};

export const getAssignmentsForClass = async (classId) => {
  return ClassTeachers.find({ classId, active: true }).populate({
    path: "teacherId",
    select: "-password",
  });
};

export const getAssignmentForTeacher = async (classId, teacherId) => {
  return ClassTeachers.findOne({ classId, teacherId, active: true });
};

export const normalizeCommissionRateValue = normalizeCommissionRate;

export const resolveCommissionRate = (assignment, mode) => {
  const fallback = Number.isFinite(Number(assignment?.commissionRate))
    ? Number(assignment.commissionRate)
    : Number(process.env.DEFAULT_COMMISSION_RATE || 1);

  const normalizedMode = normalizeAttendanceMode(mode);
  if (!normalizedMode) {
    return fallback;
  }

  if (normalizedMode === "online") {
    return Number.isFinite(Number(assignment?.onlineCommissionRate))
      ? Number(assignment.onlineCommissionRate)
      : fallback;
  }

  return Number.isFinite(Number(assignment?.offlineCommissionRate))
    ? Number(assignment.offlineCommissionRate)
    : fallback;
};
