import ClassTeachers from "../Models/ClassTeachers.js";

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
