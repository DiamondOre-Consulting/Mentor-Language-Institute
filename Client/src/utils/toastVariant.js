const errorKeywords = [
  "error",
  "failed",
  "unable",
  "already",
  "not",
  "invalid",
  "missing",
  "denied",
];

const successKeywords = [
  "success",
  "sent",
  "added",
  "updated",
  "edited",
  "deleted",
  "registered",
  "enrolled",
  "saved",
];

export const getToastVariant = (message = "") => {
  const text = String(message || "").toLowerCase();
  if (errorKeywords.some((keyword) => text.includes(keyword))) {
    return "error";
  }
  if (successKeywords.some((keyword) => text.includes(keyword))) {
    return "success";
  }
  return "info";
};
