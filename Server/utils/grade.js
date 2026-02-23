export const normalizeGradeValue = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value).trim().toLowerCase();
  if (!str) return "";
  const match = str.match(/\d+/);
  if (!match) return str;
  const num = parseInt(match[0], 10);
  if (!Number.isFinite(num)) return "";
  return String(num);
};

const gradeSuffix = (num) => {
  const mod100 = num % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (num % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const toGradeLabel = (value) => {
  const normalized = normalizeGradeValue(value);
  if (!normalized) return "";
  const num = Number(normalized);
  if (!Number.isFinite(num)) {
    return String(value).trim();
  }
  return `${num}${gradeSuffix(num)}`;
};

export const deriveGradeFromText = (text) => {
  if (!text) return "";
  const str = String(text).toLowerCase();
  const match = str.match(/\b(6|7|8|9|10|11|12)(?:st|nd|rd|th)?\b/);
  if (!match) return "";
  return toGradeLabel(match[1]);
};

export const isGradeMatch = (courseGrade, studentGrade) => {
  const courseNorm = normalizeGradeValue(courseGrade);
  if (!courseNorm) return true;
  const studentNorm = normalizeGradeValue(studentGrade);
  if (!studentNorm) return false;
  return courseNorm === studentNorm;
};

export const resolveCourseGrade = (course) => {
  const direct = toGradeLabel(course?.grade);
  if (direct) return direct;
  return deriveGradeFromText(course?.classTitle);
};
