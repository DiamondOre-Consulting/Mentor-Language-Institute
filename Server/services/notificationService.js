import Notification from "../Models/Notification.js";

export const createNotification = async ({
  userId,
  role = "student",
  type,
  title,
  message,
  classId = null,
  feeMonth = null,
  payload = {},
}) => {
  if (!userId || !type || !title || !message) return null;
  return Notification.create({
    userId,
    role,
    type,
    title,
    message,
    classId,
    feeMonth,
    payload,
  });
};

export const createNotificationsForStudents = async ({
  studentIds = [],
  type,
  title,
  message,
  classId = null,
  feeMonth = null,
  payload = {},
}) => {
  const uniqueIds = Array.from(
    new Set((studentIds || []).map((id) => String(id)))
  );
  if (!uniqueIds.length || !type || !title || !message) return [];
  const docs = uniqueIds.map((id) => ({
    userId: id,
    role: "student",
    type,
    title,
    message,
    classId,
    feeMonth,
    payload,
  }));
  return Notification.insertMany(docs, { ordered: false });
};
