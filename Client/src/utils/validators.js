export const normalizeDigits = (value) => String(value || "").replace(/\D/g, "");

export const validateRequired = (value, label = "This field") => {
  if (String(value || "").trim() === "") {
    return `${label} is required.`;
  }
  return "";
};

export const validateEmail = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "Email is required.";
  if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return "";
};

export const validatePhone = (value, { required = true } = {}) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return required ? "Phone number is required." : "";
  }
  if (!/^\d+$/.test(trimmed)) {
    return "Phone number must contain only digits.";
  }
  if (trimmed.length !== 10) {
    return "Phone number must be 10 digits.";
  }
  return "";
};

export const validateNumber = (
  value,
  { min = null, max = null, integer = false, label = "Value" } = {}
) => {
  if (value === "" || value === null || value === undefined) {
    return `${label} is required.`;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return `${label} must be a valid number.`;
  }
  if (integer && !Number.isInteger(num)) {
    return `${label} must be a whole number.`;
  }
  if (min !== null && num < min) {
    return `${label} must be at least ${min}.`;
  }
  if (max !== null && num > max) {
    return `${label} must be at most ${max}.`;
  }
  return "";
};

export const validateAmountPaid = (amount, totalFee, { required = false } = {}) => {
  if (amount === "" || amount === null || amount === undefined) {
    return required ? "Amount is required." : "";
  }
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) {
    return "Amount must be a valid number greater than zero.";
  }
  const feeNum = Number(totalFee);
  if (Number.isFinite(feeNum) && feeNum > 0 && num > feeNum) {
    return "Amount paid cannot exceed total fee.";
  }
  return "";
};

export const validateAmountPaidForMonths = (
  amount,
  totalFee,
  monthCount,
  { required = false } = {}
) => {
  const baseError = validateAmountPaid(amount, totalFee, { required });
  if (!baseError) return "";
  const feeNum = Number(totalFee);
  const amountNum = Number(amount);
  const count = Number(monthCount);
  if (
    Number.isFinite(feeNum) &&
    feeNum > 0 &&
    Number.isFinite(amountNum) &&
    count > 1 &&
    amountNum === feeNum * count
  ) {
    return "";
  }
  return baseError;
};

export const validateScheduleHours = (newHours, totalHours, alreadyScheduled) => {
  const total = Number(totalHours);
  if (!Number.isFinite(total) || total <= 0) return "";
  const next = Number(newHours) || 0;
  const existing = Number(alreadyScheduled) || 0;
  if (existing + next > total) {
    return "Total scheduled hours exceed the course total hours.";
  }
  return "";
};
