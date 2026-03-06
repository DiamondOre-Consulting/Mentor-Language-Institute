const monthMap = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

export const normalizePaidStatus = (value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "paid"].includes(normalized)) {
      return true;
    }
    if (["false", "no", "pending", "unpaid"].includes(normalized)) {
      return false;
    }
  }
  return null;
};

export const parseFeeAmount = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeFeeMonth = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (Number.isInteger(value)) {
    return value >= 1 && value <= 12 ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const numeric = Number(trimmed);
    if (Number.isInteger(numeric)) {
      return numeric >= 1 && numeric <= 12 ? numeric : null;
    }
    const month = monthMap[trimmed.toLowerCase()];
    return month || null;
  }

  return null;
};

export const formatFeeMonthLabel = (monthNumber) => {
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return "N/A";
  }
  return new Date(2020, monthNumber - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });
};

export const computePaymentState = (totalFee, amountPaid) => {
  const total = Number(totalFee);
  const paid = Number(amountPaid);
  if (!Number.isFinite(total) || total <= 0) {
    return { isPaid: false, status: "pending" };
  }
  if (!Number.isFinite(paid) || paid <= 0) {
    return { isPaid: false, status: "pending" };
  }
  if (paid >= total) {
    return { isPaid: true, status: "paid" };
  }
  return { isPaid: false, status: "partial" };
};
