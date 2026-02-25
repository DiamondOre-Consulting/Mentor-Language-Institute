export const normalizeAttendanceMode = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "online") return "online";
  if (normalized === "offline") return "offline";
  return null;
};

