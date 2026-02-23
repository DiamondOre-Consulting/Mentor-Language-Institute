import Students from "../Models/Students.js";

export const normalizeEmail = (email) => (email || "").trim().toLowerCase();

export const isValidEmail = (email) => {
  if (!email) {
    return false;
  }
  return /^\S+@\S+\.\S+$/.test(email);
};

export const findStudentUniquenessConflict = async ({
  userName,
  phone,
  email,
  excludeId,
}) => {
  const filters = [];
  if (userName) {
    filters.push({ userName });
  }
  if (phone) {
    filters.push({ phone });
  }
  if (email) {
    filters.push({ email: normalizeEmail(email) });
  }

  if (filters.length === 0) {
    return null;
  }

  const query = { $or: filters };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingStudent = await Students.findOne(query).select(
    "userName phone email"
  );
  if (!existingStudent) {
    return null;
  }

  if (userName && existingStudent.userName === userName) {
    return "Username already taken. Please enter a unique username.";
  }
  if (phone && existingStudent.phone === phone) {
    return "Phone number already exists. Please enter a unique phone number.";
  }
  if (email && existingStudent.email === normalizeEmail(email)) {
    return "Email already exists. Please enter a unique email address.";
  }

  return "Student already exists with provided details.";
};
