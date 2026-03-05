export const normalizePhone = (phone) => String(phone || "").trim();

export const isValidPhone = (phone, { minDigits = 10, maxDigits = 10 } = {}) => {
  const trimmed = normalizePhone(phone);
  if (!trimmed) return false;
  if (!/^\d+$/.test(trimmed)) return false;
  const length = trimmed.length;
  return length >= minDigits && length <= maxDigits;
};

