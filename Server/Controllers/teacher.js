import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Teachers from "../Models/Teachers.js";
import TeacherAuthenticateToken from "../Middlewares/TeacherAuthenticateToken.js";
import Classes from "../Models/Classes.js";
import Students from "../Models/Students.js";
import Attendance from "../Models/Attendance.js";
import Commission from "../Models/Commission.js";
import ClassTeachers from "../Models/ClassTeachers.js";
import Fee from "../Models/Fee.js";
import Invoice from "../Models/Invoice.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import ExcelJS from "exceljs";
import { calculateMonthlyCommission, parseClassDate, sortCommissions } from "../utils/commission.js";
import { isGradeMatch, resolveCourseGrade, toGradeLabel } from "../utils/grade.js";
import { getAssignmentForTeacher } from "../utils/classTeachers.js";
import { normalizeAttendanceMode } from "../utils/attendanceMode.js";
import { generateInvoiceNumber, generateInvoicePdfBuffer } from "../services/invoiceService.js";
import { sendEmail } from "../services/emailService.js";
import { createNotificationsForStudents } from "../services/notificationService.js";
import { isValidEmail, normalizeEmail } from "../utils/studentValidation.js";
import {
  normalizeFeeMonth,
  normalizeFeeMonths,
  normalizeFeeYear,
  normalizePaidStatus,
  parseFeeAmount,
  formatFeePeriodLabel,
  computePaymentState,
} from "../utils/fee.js";
import { findStudentUniquenessConflict } from "../utils/studentValidation.js";
import { createRefreshTokenRecord, setAccessCookie, setRefreshCookie, signAccessToken } from "../utils/authTokens.js";
import { deleteStudentCascade } from "../utils/deleteStudentCascade.js";
import { isValidPhone, normalizePhone } from "../utils/phone.js";



dotenv.config();

const router = express.Router();

const normalizeNumericInput = (value, { allowZero = false } = {}) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (allowZero) {
    if (num < 0) return null;
  } else if (num <= 0) {
    return null;
  }
  return num;
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getTotalScheduledHours = (dailyClasses = []) =>
  dailyClasses.reduce((sum, entry) => sum + toNumber(entry?.numberOfClasses), 0);

const buildModeConflictMatch = (normalizedMode) => {
  if (normalizedMode === "online") {
    return {
      $or: [
        { mode: "offline" },
        { mode: { $exists: false } },
        { mode: null },
        { mode: "" },
      ],
    };
  }
  return { mode: "online" };
};

const normalizeTimeSlots = (slots, expectedCount) => {
  const normalized = Array.isArray(slots)
    ? slots.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  if (expectedCount === 0) {
    return { ok: true, slots: [] };
  }

  if (expectedCount > 0 && normalized.length !== expectedCount) {
    return {
      ok: false,
      message: "Please provide a time for each scheduled class slot.",
    };
  }

  if (normalized.length === 0) {
    return { ok: true, slots: [] };
  }

  const seen = new Set();
  for (const slot of normalized) {
    if (!/^\d{2}:\d{2}$/.test(slot)) {
      return {
        ok: false,
        message: "Time slots must be in HH:MM format.",
      };
    }
    const [hh, mm] = slot.split(":").map(Number);
    if (
      !Number.isFinite(hh) ||
      !Number.isFinite(mm) ||
      hh < 0 ||
      hh > 23 ||
      mm < 0 ||
      mm > 59
    ) {
      return {
        ok: false,
        message: "Time slots must be valid 24-hour times.",
      };
    }
    if (seen.has(slot)) {
      return {
        ok: false,
        message: "Each scheduled class must have a unique time.",
      };
    }
    seen.add(slot);
  }

  return { ok: true, slots: normalized };
};

const parseClassDateParts = (dateStr = "") => {
  const parts = String(dateStr).split(/[-/]/).map((part) => part.trim());
  if (parts.length < 3) return null;

  let yearPart = "";
  let monthPart = "";
  let dayPart = "";

  if (parts[0].length === 4) {
    yearPart = parts[0];
    monthPart = parts[1];
    dayPart = parts[2];
  } else {
    dayPart = parts[0];
    monthPart = parts[1];
    yearPart = parts[2];
  }

  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
};

const toStartOfDay = (parts) => {
  if (!parts) return null;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const isSlotLocked = (dateStr, slot, hours = 3) => {
  if (!slot || !/^\d{2}:\d{2}$/.test(slot)) return false;
  const parts = parseClassDateParts(dateStr);
  if (!parts) return false;
  const [hh, mm] = slot.split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
  const dt = new Date(parts.year, parts.month - 1, parts.day, hh, mm, 0, 0);
  if (Number.isNaN(dt.getTime())) return false;
  const lockTime = new Date(dt.getTime() - hours * 60 * 60 * 1000);
  return new Date() >= lockTime;
};

const isSlotExpired = (dateStr, slot) => {
  if (!slot || !/^\d{2}:\d{2}$/.test(slot)) return false;
  const parts = parseClassDateParts(dateStr);
  if (!parts) return false;
  const [hh, mm] = slot.split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
  const dt = new Date(parts.year, parts.month - 1, parts.day, hh, mm, 0, 0);
  if (Number.isNaN(dt.getTime())) return false;
  return new Date() > dt;
};

const pruneExpiredDailyClasses = async (classDoc, teacherId) => {
  if (!classDoc) return false;
  let changed = false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDailyClasses = (classDoc.dailyClasses || []).filter((entry) => {
    if (teacherId && entry.teacherId && String(entry.teacherId) !== String(teacherId)) {
      return true;
    }

    const slots = Array.isArray(entry.timeSlots) ? entry.timeSlots : [];
    if (slots.length > 0) {
      const remainingSlots = slots.filter((slot) => !isSlotExpired(entry.classDate, slot));
      if (remainingSlots.length !== slots.length) {
        entry.timeSlots = remainingSlots;
        entry.numberOfClasses = String(remainingSlots.length);
        changed = true;
      }
      return remainingSlots.length > 0;
    }

    const parts = parseClassDateParts(entry.classDate);
    if (!parts) {
      return true;
    }
    const entryDate = toStartOfDay(parts);
    if (entryDate && entryDate < today) {
      changed = true;
      return false;
    }
    return true;
  });

  if (nextDailyClasses.length !== (classDoc.dailyClasses || []).length) {
    classDoc.dailyClasses = nextDailyClasses;
    changed = true;
  }

  if (changed) {
    await classDoc.save();
  }

  return changed;
};

const validateNonPastClassDate = (dateStr) => {
  const parts = parseClassDateParts(dateStr);
  const scheduledDate = toStartOfDay(parts);
  if (!scheduledDate) {
    return {
      ok: false,
      message: "Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD.",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (scheduledDate < today) {
    return {
      ok: false,
      message: "Class date cannot be in the past. Please select today or a future date.",
    };
  }

  return { ok: true };
};

const teacherHasStudentAccess = async (teacherId, studentId) => {
  const directAccess = await Teachers.exists({
    _id: teacherId,
    myStudents: studentId,
  });
  if (directAccess) return true;

  const assignments = await ClassTeachers.find({
    teacherId,
    active: true,
  }).select("classId");
  if (!assignments.length) return false;

  const classIds = assignments.map((assignment) => assignment.classId);
  return !!(await Students.exists({
    _id: studentId,
    classes: { $in: classIds },
  }));
};

router.post("/login-teacher", async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const rawIdentifier = identifier || email || phone;
    if (!rawIdentifier || !password) {
      return res
        .status(400)
        .json({ message: "Email or phone and password are required." });
    }

    const normalizedEmail = normalizeEmail(rawIdentifier);
    const query = isValidEmail(normalizedEmail)
      ? { email: normalizedEmail }
      : { phone: rawIdentifier };
    const user = await Teachers.findOne(query);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or phone number" });
    }

    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      passwordMatch = false;
    }

    if (!passwordMatch && user.password === password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
      passwordMatch = true;
    }

    if (!passwordMatch) {
      return res.status(402).json({ message: "Invalid password" });
    }

    const normalizedRole = String(user.role || "teacher").toLowerCase();
    const accessPayload = {
      userId: user._id,
      role: normalizedRole,
      name: user.name,
      phone: user.phone,
      email: user.email,
    };
    const token = signAccessToken(accessPayload, "teacher");
    const refreshToken = await createRefreshTokenRecord({
      userId: user._id,
      role: "teacher",
    });
    setAccessCookie(res, token);
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({ token });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET ALL STUDENTS (teacher access)
router.get("/all-students", TeacherAuthenticateToken, async (req, res) => {
  try {
    const allStudents = await Students.find({}, { password: 0 });
    return res.status(200).json(allStudents);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET ALL CLASSES (teacher access)
router.get("/all-classes", TeacherAuthenticateToken, async (req, res) => {
  try {
    const assignments = await ClassTeachers.find({
      teacherId: req.user.userId,
      active: true,
    }).select("classId");
    const classIds = assignments.map((a) => a.classId);

    const allClasses = await Classes.find({ _id: { $in: classIds } });
    return res.status(200).json(allClasses);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ENROLL STUDENT IN A COURSE (teacher access)
router.put(
  "/enroll-student/:id1/:id2",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { id1, id2 } = req.params;
      const { totalFee, feeMonth, feeMonths, feeYear, paid, amountPaid } = req.body;
      const normalizedPaid = normalizePaidStatus(paid);
      if (normalizedPaid === null) {
        return res.status(400).json({
          message: "Invalid payment status. Use paid or pending.",
        });
      }

      const normalizedTotalFee = parseFeeAmount(totalFee);
      if (normalizedTotalFee === null || normalizedTotalFee < 0) {
        return res.status(400).json({
          message: "Total fee must be a valid number.",
        });
      }

      const paymentDate = new Date();
      const fallbackMonth = paymentDate.getMonth() + 1;
      const fallbackYear = paymentDate.getFullYear();
      const requestedMonths = normalizeFeeMonths(feeMonths ?? feeMonth ?? fallbackMonth);
      if (!requestedMonths.length) {
        return res.status(400).json({
          message: "Fee month must be a valid month number (1-12).",
        });
      }
      if (requestedMonths.length > 1) {
        return res.status(400).json({
          message: "Multiple months are not allowed for enrollment payments.",
        });
      }
      const providedYear = normalizeFeeYear(feeYear);
      if (feeYear !== undefined && feeYear !== null && feeYear !== "" && !providedYear) {
        return res.status(400).json({
          message: "Fee year must be a valid year (e.g., 2026).",
        });
      }
      const normalizedFeeYear = providedYear || fallbackYear;

      const normalizedAmountPaidInput = parseFeeAmount(amountPaid);
      const normalizedAmountPaid =
        normalizedAmountPaidInput === null ? 0 : normalizedAmountPaidInput;
      if (normalizedPaid && normalizedAmountPaid <= 0) {
        return res.status(400).json({
          message: "Amount paid must be a valid number when payment is marked paid.",
        });
      }
      if (normalizedAmountPaid < 0) {
        return res.status(400).json({
          message: "Amount paid must be a valid number.",
        });
      }
      const monthCount = requestedMonths.length;
      if (normalizedAmountPaid > normalizedTotalFee) {
        const fullTotal = normalizedTotalFee * monthCount;
        if (!(monthCount > 1 && normalizedAmountPaid === fullTotal)) {
          return res.status(400).json({
            message:
              "Amount paid cannot exceed total fee (or total fee times the number of months).",
          });
        }
      }

      let perMonthAmountPaid = normalizedAmountPaid;
      if (monthCount > 1 && normalizedAmountPaid > normalizedTotalFee) {
        perMonthAmountPaid = normalizedTotalFee;
      }

      const paymentState = computePaymentState(
        normalizedTotalFee,
        perMonthAmountPaid
      );
      const effectivePaid = paymentState.isPaid;
      const paymentStatus = paymentState.status;
      const hasPayment = perMonthAmountPaid > 0;

      const classExists = await Classes.findById(id1);
      if (!classExists) {
        return res.status(404).json({ message: "Class not found." });
      }
      const assignment = await getAssignmentForTeacher(id1, req.user?.userId);
      if (!assignment) {
        return res.status(403).json({
          message: "You can only enroll students in your assigned courses.",
        });
      }

      const studentExists = await Students.findById(id2);
      if (!studentExists) {
        return res.status(404).json({ message: "Student not found." });
      }
      const alreadyInStudent = (studentExists.classes || []).some(
        (classId) => String(classId) === String(id1)
      );
      if (alreadyInStudent) {
        return res
          .status(409)
          .json({ message: `Student already exists in this class!!!` });
      }
      const resolvedCourseGrade = resolveCourseGrade(classExists);
      if (resolvedCourseGrade && !classExists.grade) {
        classExists.grade = resolvedCourseGrade;
        await classExists.save();
      }
      if (resolvedCourseGrade && !isGradeMatch(resolvedCourseGrade, studentExists?.grade)) {
        return res.status(400).json({
          message: "Student grade does not match the course grade.",
        });
      }

      if (hasPayment && !studentExists.email) {
        return res.status(400).json({
          message: "Student email is required to send the invoice.",
        });
      }

      const studentExist = await Classes.findOne({
        _id: id1,
        enrolledStudents: id2,
      });

      if (studentExist) {
        return res
          .status(409)
          .json({ message: `Student already exists in this class!!!` });
      }

      const updateClass = await Classes.findByIdAndUpdate(
        { _id: id1 },
        {
          $addToSet: { enrolledStudents: id2 },
        },
        { new: true }
      );

      if (updateClass) {
        await ClassAccessStatus.findOneAndUpdate(
          { classId: id1, studentId: id2 },
          { classAccessStatus: true },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        let feeRecord = await Fee.findOne({ classId: id1, studentId: id2 });
        if (!feeRecord) {
          feeRecord = new Fee({
            classId: id1,
            studentId: id2,
            totalFee: normalizedTotalFee,
            detailFee: [],
          });
        }

        const currentYear = new Date().getFullYear();
        const resolveDetailYear = (detail) => {
          const yearValue = normalizeFeeYear(detail?.feeYear);
          if (yearValue) return yearValue;
          return normalizedFeeYear === currentYear ? currentYear : null;
        };
        const wasPaidByMonth = new Map();
        requestedMonths.forEach((monthValue) => {
          const existingDetail = feeRecord.detailFee.find(
            (detail) =>
              normalizeFeeMonth(detail.feeMonth) === monthValue &&
              resolveDetailYear(detail) === normalizedFeeYear
          );
          wasPaidByMonth.set(monthValue, existingDetail?.paid === true);

          if (existingDetail) {
            existingDetail.paid = effectivePaid;
            existingDetail.amountPaid = perMonthAmountPaid ?? 0;
            existingDetail.feeYear = normalizedFeeYear;
          } else {
            feeRecord.detailFee.push({
              feeMonth: monthValue,
              feeYear: normalizedFeeYear,
              paid: effectivePaid,
              amountPaid: perMonthAmountPaid ?? 0,
            });
          }
        });

        feeRecord.totalFee = normalizedTotalFee;
        await feeRecord.save();

        await Students.findByIdAndUpdate(
          { _id: id2 },
          {
            $addToSet: { classes: id1, feeDetail: feeRecord._id },
            $pull: { appliedClasses: id1 },
          },
          { new: true }
        );

        await Classes.findByIdAndUpdate(
          { _id: id1 },
          {
            $pull: { appliedStudents: id2 },
          },
          { new: true }
        );

        if (hasPayment) {
          const studentEmail = studentExists.email;
          const invoiceYearMatch =
            normalizedFeeYear === currentYear
              ? { $in: [normalizedFeeYear, null] }
              : normalizedFeeYear;

          for (const monthValue of requestedMonths) {
            const issuedAt = new Date();
            let invoiceRecord = await Invoice.findOne({
              feeId: feeRecord._id,
              feeMonth: monthValue,
              feeYear: invoiceYearMatch,
              studentId: id2,
            });

            if (invoiceRecord?.emailStatus === "sent" && wasPaidByMonth.get(monthValue)) {
              continue;
            }

            let invoiceNumber = invoiceRecord?.invoiceNumber;
            if (!invoiceRecord) {
              invoiceNumber = generateInvoiceNumber(issuedAt);
              try {
                invoiceRecord = await Invoice.create({
                  invoiceNumber,
                  classId: id1,
                  studentId: id2,
                  feeId: feeRecord._id,
                  feeMonth: monthValue,
                  feeYear: normalizedFeeYear,
                  totalFee: normalizedTotalFee,
                  amountPaid: perMonthAmountPaid ?? 0,
                  sentToEmail: studentEmail,
                });
              } catch (error) {
                if (error?.code === 11000) {
                  invoiceNumber = generateInvoiceNumber(new Date());
                  invoiceRecord = await Invoice.create({
                    invoiceNumber,
                    classId: id1,
                    studentId: id2,
                    feeId: feeRecord._id,
                    feeMonth: monthValue,
                    feeYear: normalizedFeeYear,
                    totalFee: normalizedTotalFee,
                    amountPaid: perMonthAmountPaid ?? 0,
                    sentToEmail: studentEmail,
                  });
                } else {
                  throw error;
                }
              }
            }

            if (invoiceRecord && invoiceRecord.emailStatus !== "sent") {
              try {
                const pdfBuffer = await generateInvoicePdfBuffer({
                  invoiceNumber: invoiceRecord.invoiceNumber,
                  issuedAt,
                  studentName: studentExists.name,
                  studentEmail,
                  classTitle: classExists.classTitle,
                  feeMonth: monthValue,
                  feeYear: normalizedFeeYear,
                  totalFee: normalizedTotalFee,
                  amountPaid: perMonthAmountPaid ?? 0,
                  currency: process.env.INVOICE_CURRENCY || "INR",
                });

                const feeMonthLabel = formatFeePeriodLabel(monthValue, normalizedFeeYear);
                const subject = `Invoice ${invoiceRecord.invoiceNumber} for ${classExists.classTitle}`;
                const text = `Hi ${studentExists.name},\n\nThank you for your payment. Please find your invoice (${invoiceRecord.invoiceNumber}) attached.\n\nCourse: ${classExists.classTitle}\nFee Month: ${feeMonthLabel}\nTotal Fee: ${normalizedTotalFee}\nAmount Paid: ${perMonthAmountPaid}\n\nRegards,\nMentor Language Institute`;
                const html = `
              <div style="font-family:Arial, sans-serif; line-height:1.6; color:#111;">
                <p>Hi ${studentExists.name},</p>
                <p>Thank you for your payment. Please find your invoice attached.</p>
                <p><strong>Invoice:</strong> ${invoiceRecord.invoiceNumber}</p>
                <p><strong>Course:</strong> ${classExists.classTitle}<br/>
                <strong>Fee Month:</strong> ${feeMonthLabel}<br/>
                <strong>Total Fee:</strong> ${normalizedTotalFee}<br/>
                <strong>Amount Paid:</strong> ${perMonthAmountPaid}</p>
                <p>Regards,<br/>Mentor Language Institute</p>
              </div>
            `;

                await sendEmail({
                  to: studentEmail,
                  subject,
                  text,
                  html,
                  attachments: [
                    {
                      filename: `Invoice-${invoiceRecord.invoiceNumber}.pdf`,
                      content: pdfBuffer,
                      contentType: "application/pdf",
                    },
                  ],
                });

                await Invoice.findByIdAndUpdate(invoiceRecord._id, {
                  emailStatus: "sent",
                });
              } catch (emailError) {
                console.error("Invoice email failed:", emailError);
                await Invoice.findByIdAndUpdate(invoiceRecord._id, {
                  emailStatus: "failed",
                  emailError: emailError?.message || "Email delivery failed.",
                });
              }
            }
          }
        }
      }

      try {
        const title = `Enrolled in ${classExists.classTitle}`;
        for (const monthValue of requestedMonths) {
          const feeMonthLabel = formatFeePeriodLabel(monthValue, normalizedFeeYear);
          const message =
            paymentStatus === "paid"
              ? `You have been enrolled in ${classExists.classTitle}. Payment received for ${feeMonthLabel} and invoice sent.`
            : paymentStatus === "partial"
              ? `You have been enrolled in ${classExists.classTitle}. Partial payment received for ${feeMonthLabel}. Remaining balance is pending.`
              : `You have been enrolled in ${classExists.classTitle}. Payment is pending for ${feeMonthLabel}.`;
          await createNotificationsForStudents({
            studentIds: [studentExists._id],
            type: "COURSE_ENROLLED",
            title,
            message,
            classId: classExists._id,
            feeMonth: monthValue,
            feeYear: normalizedFeeYear,
            payload: {
              classTitle: classExists.classTitle,
              feeMonth: monthValue,
              feeYear: normalizedFeeYear,
              paid: effectivePaid,
              amountPaid: perMonthAmountPaid ?? 0,
              paymentStatus,
            },
          });
        }
      } catch (notifyError) {
        console.error("Failed to notify student enrollment:", notifyError);
      }

      return res.status(200).json({
        message: `${studentExists.name} enrolled in ${classExists.classTitle} successfully.`,
      });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error);
    }
  }
);



// MY PROFILE
router.get("/my-profile", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const myProfile = await Teachers.findById({ _id: userId });

    if (!myProfile) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const assignments = await ClassTeachers.find({
      teacherId: userId,
      active: true,
    }).select("classId");
    const myClasses = assignments.map((a) => a.classId);

    res.status(200).json({
      userId,
      role: myProfile.role,
      name: myProfile.name,
      phone: myProfile.phone,
      email: myProfile.email,
      dob: myProfile.dob,
      myClasses,
      myScheduledClasses: myProfile.myScheduledClasses,
    });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.put("/my-profile", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, phone, email, dob, password } = req.body;

    if (!name && !phone && !email && !dob && !password) {
      return res.status(400).json({ message: "No profile changes provided." });
    }

    const teacher = await Teachers.findById(userId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({ message: "Phone number must be 10 digits." });
      }
      const existingTeacher = await Teachers.findOne({ phone: normalizedPhone });
      if (existingTeacher && existingTeacher._id.toString() !== userId) {
        return res.status(400).json({
          message: "Phone already exists. Please enter a unique phone number.",
        });
      }
      teacher.phone = normalizedPhone;
    }

    if (email) {
      const normalizedEmail = normalizeEmail(email);
      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Please enter a valid email." });
      }
      const existingTeacher = await Teachers.findOne({ email: normalizedEmail });
      if (existingTeacher && existingTeacher._id.toString() !== userId) {
        return res.status(400).json({
          message: "Email already exists. Please enter a unique email address.",
        });
      }
      teacher.email = normalizedEmail;
    }

    if (name) {
      teacher.name = name;
    }

    if (dob) {
      teacher.dob = dob;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      teacher.password = await bcrypt.hash(password, salt);
    }

    await teacher.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      teacher: {
        userId: teacher._id,
        role: teacher.role,
        name: teacher.name,
        phone: teacher.phone,
        email: teacher.email,
        dob: teacher.dob,
      },
    });
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/add-student", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
  const { name, phone, password, userName, dob, courseId, grade, email } = req.body;
  const gradeLabel = toGradeLabel(grade);

  if (!name || !phone || !password || !userName || !email) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (!gradeLabel) {
    return res.status(400).json({ message: "Grade is required." });
  }

    const normalizedEmail = normalizeEmail(email);
    const normalizedUserName = userName.trim();
  const normalizedPhone = normalizePhone(phone);
  if (!isValidPhone(normalizedPhone)) {
    return res.status(400).json({ message: "Phone number must be 10 digits." });
  }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    const conflictMessage = await findStudentUniquenessConflict({
      userName: normalizedUserName,
      phone: normalizedPhone,
      email: normalizedEmail,
    });
    if (conflictMessage) {
      return res.status(409).json({ message: conflictMessage });
    }

    let classData = null;

    // If courseId is provided, validate the class
    if (courseId) {
      classData = await Classes.findOne({ _id: courseId });
      if (!classData) {
        return res
          .status(404)
          .json({ message: "Class not found or unauthorized." });
      }
      const assignment = await ClassTeachers.findOne({
        classId: courseId,
        teacherId: userId,
        active: true,
      });
      if (!assignment) {
        return res
          .status(403)
          .json({ message: "You are not assigned to this class." });
      }
      const resolvedCourseGrade = resolveCourseGrade(classData);
      if (resolvedCourseGrade && !classData.grade) {
        classData.grade = resolvedCourseGrade;
        await classData.save();
      }
      if (resolvedCourseGrade && !isGradeMatch(resolvedCourseGrade, gradeLabel)) {
        return res.status(400).json({
          message: "Student grade does not match the selected course grade.",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const newStudent = new Students({
      branch: "Main",
      userName: normalizedUserName,
      dob,
      name,
      phone: normalizedPhone,
      email: normalizedEmail,
      password: hashedPassword,
      grade: gradeLabel,
      classes: courseId ? [courseId] : [],
    });

    await newStudent.save();

    // Add student to teacher's list
    await Teachers.findByIdAndUpdate(userId, {
      $addToSet: { myStudents: newStudent._id },
    });

    // Add to class if courseId exists
    if (classData) {
      await Classes.findByIdAndUpdate(classData._id, {
        $addToSet: { enrolledStudents: newStudent._id },
      });

      await ClassAccessStatus.findOneAndUpdate(
        { classId: classData._id, studentId: newStudent._id },
        { classAccessStatus: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      let feeRecord = await Fee.findOne({
        classId: classData._id,
        studentId: newStudent._id,
      });
      if (!feeRecord) {
        feeRecord = await Fee.create({
          classId: classData._id,
          studentId: newStudent._id,
          totalFee: 0,
          detailFee: [],
        });
      }

      await Students.findByIdAndUpdate(newStudent._id, {
        $addToSet: { feeDetail: feeRecord._id },
      });
    }

    return res.status(200).json({
      message: "New student has been registered successfully!",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Username, phone number, or email already exists.",
      });
    }
    console.error("Something went wrong:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/all-my-students", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const assignments = await ClassTeachers.find({
      teacherId: userId,
      active: true,
    }).select("classId");
    const classIds = assignments.map((a) => a.classId);

    const classes = await Classes.find({ _id: { $in: classIds } }).populate({
      path: "enrolledStudents",
      model: "Student",
      select: "-password",
      populate: {
        path: "attendanceDetail",
        model: "Attendance",
      },
    });

    const allStudents = classes.flatMap((cls) => cls.enrolledStudents || []);

    if (!allStudents || allStudents.length === 0) {
      return res
        .status(404)
        .json({ message: "No students are enrolled in your classes." });
    }

    res.status(200).json(allStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/my-students", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const assignments = await ClassTeachers.find({
      teacherId: userId,
      active: true,
    }).select("classId");
    const classIds = assignments.map((a) => a.classId);

    const classes = await Classes.find({ _id: { $in: classIds } }).populate({
      path: "enrolledStudents",
      model: "Student",
      match: { deactivated: false },
      select: "-password",
      populate: {
        path: "attendanceDetail",
        model: "Attendance",
      },
    });

    const allStudents = classes.flatMap((cls) => cls.enrolledStudents || []);

    if (!allStudents || allStudents.length === 0) {
      return res
        .status(404)
        .json({ message: "No students are enrolled in your classes." });
    }

    res.status(200).json(allStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/student-edit/:id", TeacherAuthenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, phone, password, userName, dob, grade, email } = req.body;

  try {
    // Validate input fields (optional, depending on your requirements)

    // Find the student by ID
    const student = await Students.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const normalizedEmail = email ? normalizeEmail(email) : null;
    const normalizedUserName = userName ? userName.trim() : null;
    const normalizedPhone = phone ? normalizePhone(phone) : null;
    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits." });
    }
    if (email && !isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    const conflictMessage = await findStudentUniquenessConflict({
      userName: normalizedUserName,
      phone: normalizedPhone,
      email: normalizedEmail,
      excludeId: id,
    });
    if (conflictMessage) {
      return res.status(400).json({ message: conflictMessage });
    }

    // Update student details
    // student.name = name || student.name;
    // student.phone = phone || student.phone;
    // student.branch = branch || student.branch;
    // student.userName = userName || student.userName;
    // student.dob = dob || student.dob;
    if (name) {
      student.name = name;
    }
    if (phone) {
      student.phone = normalizedPhone;
    }
    if (userName) {
      student.userName = normalizedUserName;
    }
    if (email) {
      student.email = normalizedEmail;
    }
    if (dob) {
      student.dob = dob;
    }

    if (grade) {
      student.grade = await toGradeLabel(grade);
    }

    // If password is provided, hash it and update the password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);
    }

    // Save the updated student details
    await student.save();

    // Send a success response
    res.status(200).json({ message: "Student details updated successfully." });
  } catch (error) {
    console.error("Error updating student details:", error);
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Username, phone number, or email already exists.",
      });
    }
    res.status(500).json({ message: "Server error." });
  }
});

router.delete("/delete-student/:id",TeacherAuthenticateToken,async (req, res) => {
    try {
      const { id } = req.params;

      const deletedStudent = await deleteStudentCascade(id);
      if (!deletedStudent) {
        return res
          .status(403)
          .json({ message: "No student Found with this id" });
      }

      res.status(200).json({ message: "Student deleted successfully!!!" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Something went wrong!!!", error });
    }
  }
);

router.get("/my-classes", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const assignments = await ClassTeachers.find({
      teacherId: userId,
      active: true,
    }).select("classId");
    const classIds = assignments.map((a) => a.classId);

    const allMyClasses = await Classes.find({
      _id: { $in: classIds },
    });

    if (!allMyClasses) {
      return res
        .status(405)
        .json({ message: "No classes has been assigned to you" });
    }

    for (const classDoc of allMyClasses) {
      await pruneExpiredDailyClasses(classDoc, userId);
    }

    res.status(200).json(allMyClasses);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.get("/my-classes/:id", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await ClassTeachers.findOne({
      classId: id,
      teacherId: req.user.userId,
      active: true,
    });
    if (!assignment) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const getClassById = await Classes.findById({ _id: id });

    if (!getClassById) {
      return res.status(405).json({ message: "Class not found" });
    }

    const normalizedDailyClasses = (getClassById.dailyClasses || []).filter(
      (entry) =>
        !entry.teacherId ||
        String(entry.teacherId) === String(req.user.userId)
    );
    getClassById.dailyClasses = normalizedDailyClasses;

    await pruneExpiredDailyClasses(getClassById, req.user.userId);

    res.status(200).json(getClassById);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ADD-ATTENDANCE-CLASS
router.post("/schedule-class/:id",TeacherAuthenticateToken,async (req, res) => {
    try {
      const { id } = req.params;
      const { date, numberOfClasses, mode, timeSlots } = req.body;
      const normalizedMode = normalizeAttendanceMode(mode) || "offline";
      if (!date || numberOfClasses === undefined || numberOfClasses === null) {
        return res.status(400).json({
          message: "date and numberOfClasses are required.",
        });
      }
      const dateValidation = validateNonPastClassDate(date);
      if (!dateValidation.ok) {
        return res.status(400).json({ message: dateValidation.message });
      }
      const normalizedClasses = Number(numberOfClasses);
      if (!Number.isFinite(normalizedClasses) || normalizedClasses < 0) {
        return res.status(400).json({
          message: "numberOfClasses must be a valid non-negative number.",
        });
      }
      const normalizedTimeSlots = normalizeTimeSlots(timeSlots, normalizedClasses);
      if (!normalizedTimeSlots.ok) {
        return res.status(400).json({ message: normalizedTimeSlots.message });
      }
      const lockedSlots = normalizedTimeSlots.slots.filter((slot) =>
        isSlotLocked(date, slot)
      );
      if (lockedSlots.length > 0) {
        return res.status(403).json({
          message: "You cannot schedule slots within 3 hours of their start time.",
        });
      }

      const assignment = await ClassTeachers.findOne({
        classId: id,
        teacherId: req.user.userId,
        active: true,
      });
      if (!assignment) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const classDoc = await Classes.findById(id);
      if (!classDoc) {
        return res.status(404).json({ message: "Class not found." });
      }
      await pruneExpiredDailyClasses(classDoc, req.user.userId);

      const existingSessionForDate = (classDoc.dailyClasses || []).find(
        (entry) =>
          entry.classDate === date &&
          String(entry.teacherId) === String(req.user.userId)
      );
      if (existingSessionForDate) {
        const existingMode =
          normalizeAttendanceMode(existingSessionForDate.mode) || "offline";
        if (existingMode !== normalizedMode) {
          return res.status(409).json({
            message: `Attendance already marked for this date in ${existingMode} mode.`,
          });
        }
      }

      const conflictMatch = buildModeConflictMatch(normalizedMode);
      const conflictingAttendance = await Attendance.exists({
        classId: id,
        "detailAttendance": {
          $elemMatch: {
            classDate: date,
            teacherId: req.user.userId,
            ...conflictMatch,
          },
        },
      });
      if (conflictingAttendance) {
        const otherMode = normalizedMode === "online" ? "offline" : "online";
        return res.status(409).json({
          message: `Attendance already marked for this date in ${otherMode} mode.`,
        });
      }

      const existingSessionIndex = (classDoc.dailyClasses || []).findIndex(
        (entry) =>
          entry.classDate === date &&
          String(entry.teacherId) === String(req.user.userId) &&
          (normalizeAttendanceMode(entry.mode) || "offline") === normalizedMode
      );

      const existingTotal = getTotalScheduledHours(classDoc.dailyClasses || []);
      const classTotalHours = toNumber(classDoc.totalHours);

      if (existingSessionIndex >= 0) {
        const existingSlots = Array.isArray(
          classDoc.dailyClasses[existingSessionIndex].timeSlots
        )
          ? classDoc.dailyClasses[existingSessionIndex].timeSlots
          : [];
        const duplicateSlots = normalizedTimeSlots.slots.filter((slot) =>
          existingSlots.includes(slot)
        );
        if (duplicateSlots.length > 0) {
          return res.status(409).json({
            message: "One or more time slots already exist for this class date.",
          });
        }
        const mergedSlots = [...existingSlots, ...normalizedTimeSlots.slots];
        const previousHours = toNumber(
          classDoc.dailyClasses[existingSessionIndex].numberOfClasses
        );
        const proposedTotal = existingTotal - previousHours + mergedSlots.length;
        if (classTotalHours > 0 && proposedTotal > classTotalHours) {
          return res.status(400).json({
            message: "Total scheduled hours exceed the course total hours.",
          });
        }
        classDoc.dailyClasses[existingSessionIndex].timeSlots = mergedSlots;
        classDoc.dailyClasses[existingSessionIndex].numberOfClasses =
          String(mergedSlots.length);
      } else {
        const proposedTotal = existingTotal + normalizedClasses;
        if (classTotalHours > 0 && proposedTotal > classTotalHours) {
          return res.status(400).json({
            message: "Total scheduled hours exceed the course total hours.",
          });
        }
        classDoc.dailyClasses.push({
          classDate: date,
          numberOfClasses: String(normalizedClasses),
          teacherId: req.user.userId,
          mode: normalizedMode,
          timeSlots: normalizedTimeSlots.slots,
        });
      }

      const addNewClass = await classDoc.save();

      const studentIds = addNewClass?.enrolledStudents || [];

      // Check if there's an existing document in Attendance collection for each student
      for (const studentId of studentIds) {
        let attendanceDoc = await Attendance.findOne({
          classId: id,
          studentId,
        });

        if (!attendanceDoc) {
          const newAttendance = new Attendance({
            classId: id,
            studentId,
            detailAttendance: [
              {
                classDate: date,
                teacherId: req.user.userId,
                mode: normalizedMode,
              },
            ],
          });

          await newAttendance.save();

          await Students.findByIdAndUpdate(
            { _id: studentId },
            {
              $addToSet: { attendanceDetail: newAttendance._id },
            },
            { new: true }
          );
          continue;
        }

        const existingEntry = attendanceDoc.detailAttendance?.find((entry) => {
          const dateMatch = entry.classDate === date;
          const teacherMatch =
            String(entry.teacherId) === String(req.user.userId);
          return dateMatch && teacherMatch;
        });

        if (existingEntry) {
          if (!existingEntry.mode) {
            existingEntry.mode = normalizedMode;
            await attendanceDoc.save();
          }
          continue;
        }

        attendanceDoc.detailAttendance.push({
          classDate: date,
          teacherId: req.user.userId,
          mode: normalizedMode,
        });

        await attendanceDoc.save();
      }

      try {
        const modeLabel = normalizedMode === "online" ? "Online" : "Offline";
        const timeLabel =
          normalizedTimeSlots.slots.length > 0
            ? ` at ${normalizedTimeSlots.slots.join(", ")}`
            : "";
        await createNotificationsForStudents({
          studentIds,
          type: "CLASS_SCHEDULED",
          title: `${modeLabel} class scheduled`,
          message: `${classDoc.classTitle} is scheduled on ${date}${timeLabel}.`,
          classId: classDoc._id,
          payload: {
            classTitle: classDoc.classTitle,
            date,
            timeSlots: normalizedTimeSlots.slots,
            mode: normalizedMode,
            teacherId: req.user.userId,
          },
        });
      } catch (notifyError) {
        console.error("Failed to notify class schedule:", notifyError);
      }

      res.status(200).json({ message: "New class is scheduled" });
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

// UPDATE TOTAL HOURS OF A CLASS
router.put("/update-class-hours/:id",TeacherAuthenticateToken,async (req, res) => {
    try {
      const { id } = req.params;
      const { updatedHours } = req.body;
      const normalizedHours = normalizeNumericInput(updatedHours, { allowZero: true });
      if (normalizedHours === null) {
        return res.status(400).json({ message: "Updated hours must be a valid number." });
      }

      const assignment = await ClassTeachers.findOne({
        classId: id,
        teacherId: req.user.userId,
        active: true,
      });
      if (!assignment) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const singleClass = await Classes.findByIdAndUpdate(
        { _id: id },
        { $set: { totalHours: normalizedHours } },
        { new: true }
      );

      res.status(200).json({
        message: "Total hours of the class has been updated successfully.",
        data: singleClass,
      });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error);
    }
  }
);

router.get("/attendance/:id", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceDate, mode } = req.query;
    const normalizedMode = normalizeAttendanceMode(mode);
    if (mode && !normalizedMode) {
      return res.status(400).json({ message: "Invalid mode. Use online or offline." });
    }

    const attendances = await Attendance.find({
      classId: id,
      "detailAttendance.classDate": attendanceDate,
    });

    if (!attendances) {
      return res.status(403).json({ message: "No record found!!!" });
    }

    const filtered = attendances.map((doc) => {
      const detailAttendance = (doc.detailAttendance || []).filter(
        (entry) => {
          const dateMatch = entry.classDate === attendanceDate;
          const teacherMatch =
            String(entry.teacherId) === String(req.user.userId);
          const entryMode = normalizeAttendanceMode(entry.mode) || "offline";
          const modeMatch = normalizedMode ? entryMode === normalizedMode : true;
          return dateMatch && teacherMatch && modeMatch;
        }
      );
      return {
        ...doc.toObject(),
        detailAttendance,
      };
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.put("/update-attendance/:id1/:id2",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { id1, id2 } = req.params;
      const { attendanceDate, numberOfClassesTaken, mode } = req.body;
      const normalizedMode = normalizeAttendanceMode(mode);
      if (mode !== undefined && normalizedMode === null) {
        return res.status(400).json({ message: "Invalid mode. Use online or offline." });
      }

      const assignment = await getAssignmentForTeacher(id1, req.user.userId);
      if (!assignment) {
        return res.status(403).json({ message: "Unauthorized." });
      }
      const attendanceDoc = await Attendance.findOne({
        classId: id1,
        studentId: id2,
        "detailAttendance.classDate": attendanceDate,
        "detailAttendance.teacherId": req.user.userId,
      });

      if (!attendanceDoc) {
        return res
          .status(404)
          .json({ message: "Attendance record not found." });
      }

      const detail = (attendanceDoc.detailAttendance || []).find((entry) => {
        const dateMatch = entry.classDate === attendanceDate;
        const teacherMatch =
          String(entry.teacherId) === String(req.user.userId);
        const entryMode = normalizeAttendanceMode(entry.mode) || "offline";
        const modeMatch = normalizedMode ? entryMode === normalizedMode : true;
        return dateMatch && teacherMatch && modeMatch;
      });

      if (!detail) {
        return res
          .status(404)
          .json({ message: "Attendance entry not found." });
      }

      const modeToUse =
        normalizedMode || normalizeAttendanceMode(detail.mode) || "offline";
      detail.numberOfClassesTaken = numberOfClassesTaken;
      detail.commission = 0;
      if (normalizedMode || !detail.mode) {
        detail.mode = modeToUse;
      }

      await attendanceDoc.save();

      res.status(200).json(attendanceDoc);
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error);
    }
  }
);

router.put("/schedule-class/:id", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, mode, timeSlots } = req.body;
    const normalizedMode = normalizeAttendanceMode(mode) || "offline";

    if (!date || !Array.isArray(timeSlots)) {
      return res.status(400).json({
        message: "date and timeSlots are required.",
      });
    }

    const dateValidation = validateNonPastClassDate(date);
    if (!dateValidation.ok) {
      return res.status(400).json({ message: dateValidation.message });
    }

    const normalizedTimeSlots = normalizeTimeSlots(timeSlots, timeSlots.length);
    if (!normalizedTimeSlots.ok) {
      return res.status(400).json({ message: normalizedTimeSlots.message });
    }
    if (normalizedTimeSlots.slots.length === 0) {
      return res.status(400).json({ message: "At least one time slot is required." });
    }

    const assignment = await ClassTeachers.findOne({
      classId: id,
      teacherId: req.user.userId,
      active: true,
    });
    if (!assignment) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const classDoc = await Classes.findById(id);
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found." });
    }
    await pruneExpiredDailyClasses(classDoc, req.user.userId);

    const sessionIndex = (classDoc.dailyClasses || []).findIndex(
      (entry) =>
        entry.classDate === date &&
        String(entry.teacherId) === String(req.user.userId) &&
        (normalizeAttendanceMode(entry.mode) || "offline") === normalizedMode
    );

    if (sessionIndex < 0) {
      return res.status(404).json({ message: "Scheduled class not found." });
    }

    const session = classDoc.dailyClasses[sessionIndex];
    const existingSlots = Array.isArray(session.timeSlots) ? session.timeSlots : [];
    const previousSlots = [...existingSlots];
    const lockedSlots = existingSlots.filter((slot) => isSlotLocked(date, slot));

    for (const lockedSlot of lockedSlots) {
      if (!normalizedTimeSlots.slots.includes(lockedSlot)) {
        return res.status(403).json({
          message: "Locked slots cannot be removed or changed.",
        });
      }
    }

    const lockedSet = new Set(lockedSlots);
    const lockedViolations = normalizedTimeSlots.slots.filter(
      (slot) => !lockedSet.has(slot) && isSlotLocked(date, slot)
    );
    if (lockedViolations.length > 0) {
      return res.status(403).json({
        message: "You cannot set slots within 3 hours of their start time.",
      });
    }

    const existingTotal = getTotalScheduledHours(classDoc.dailyClasses || []);
    const classTotalHours = toNumber(classDoc.totalHours);
    const previousHours = toNumber(session.numberOfClasses);
    const proposedTotal =
      existingTotal - previousHours + normalizedTimeSlots.slots.length;
    if (classTotalHours > 0 && proposedTotal > classTotalHours) {
      return res.status(400).json({
        message: "Total scheduled hours exceed the course total hours.",
      });
    }

    session.timeSlots = normalizedTimeSlots.slots;
    session.numberOfClasses = String(normalizedTimeSlots.slots.length);

    await classDoc.save();

    try {
      const modeLabel = normalizedMode === "online" ? "Online" : "Offline";
      const timeLabel =
        normalizedTimeSlots.slots.length > 0
          ? ` at ${normalizedTimeSlots.slots.join(", ")}`
          : "";
      await createNotificationsForStudents({
        studentIds: classDoc.enrolledStudents || [],
        type: "CLASS_RESCHEDULED",
        title: `${modeLabel} class rescheduled`,
        message: `${classDoc.classTitle} schedule updated for ${date}${timeLabel}.`,
        classId: classDoc._id,
        payload: {
          classTitle: classDoc.classTitle,
          date,
          previousSlots,
          timeSlots: normalizedTimeSlots.slots,
          mode: normalizedMode,
          teacherId: req.user.userId,
        },
      });
    } catch (notifyError) {
      console.error("Failed to notify schedule update:", notifyError);
    }

    return res.status(200).json({ message: "Schedule updated successfully." });
  } catch (error) {
    console.error("Schedule update failed:", error);
    res.status(500).json({ message: "Unable to update schedule." });
  }
});

// CANCEL A SCHEDULED CLASS (teacher access)
router.delete("/schedule-class/:id", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, mode, timeSlots } = req.body;
    const normalizedMode = normalizeAttendanceMode(mode) || "offline";

    if (!date) {
      return res.status(400).json({ message: "date is required." });
    }

    const assignment = await ClassTeachers.findOne({
      classId: id,
      teacherId: req.user.userId,
      active: true,
    });
    if (!assignment) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const classDoc = await Classes.findById(id);
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found." });
    }
    await pruneExpiredDailyClasses(classDoc, req.user.userId);

    const sessionIndex = (classDoc.dailyClasses || []).findIndex(
      (entry) =>
        entry.classDate === date &&
        String(entry.teacherId) === String(req.user.userId) &&
        (normalizeAttendanceMode(entry.mode) || "offline") === normalizedMode
    );

    if (sessionIndex < 0) {
      return res.status(404).json({ message: "Scheduled class not found." });
    }

    const session = classDoc.dailyClasses[sessionIndex];
    const existingSlots = Array.isArray(session.timeSlots) ? session.timeSlots : [];
    const slotsToRemove =
      Array.isArray(timeSlots) && timeSlots.length > 0
        ? timeSlots
        : existingSlots;

    const lockedToRemove = slotsToRemove.filter((slot) => isSlotLocked(date, slot));
    if (lockedToRemove.length > 0) {
      return res.status(403).json({
        message: "You cannot cancel slots within 3 hours of their start time.",
      });
    }

    const nextSlots = existingSlots.filter((slot) => !slotsToRemove.includes(slot));

    if (nextSlots.length > 0) {
      session.timeSlots = nextSlots;
      session.numberOfClasses = String(nextSlots.length);
    } else {
      classDoc.dailyClasses.splice(sessionIndex, 1);
    }

    await classDoc.save();

    try {
      const removedLabel = slotsToRemove.length
        ? ` (${slotsToRemove.join(", ")})`
        : "";
      await createNotificationsForStudents({
        studentIds: classDoc.enrolledStudents || [],
        type: "CLASS_CANCELLED",
        title: "Class cancelled",
        message: `${classDoc.classTitle} on ${date}${removedLabel} has been cancelled.`,
        classId: classDoc._id,
        payload: {
          classTitle: classDoc.classTitle,
          date,
          cancelledSlots: slotsToRemove,
          mode: normalizedMode,
          teacherId: req.user.userId,
        },
      });
    } catch (notifyError) {
      console.error("Failed to notify class cancellation:", notifyError);
    }

    return res.status(200).json({ message: "Scheduled class cancelled." });
  } catch (error) {
    console.error("Cancel schedule failed:", error);
    res.status(500).json({ message: "Unable to cancel schedule." });
  }
});

// BULK MARK ATTENDANCE FOR A CLASS DATE
router.post(
  "/attendance/bulk/:classId",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const {
        classDate,
        numberOfClasses,
        presentStudentIds = [],
        mode,
      } = req.body;
      const normalizedMode = normalizeAttendanceMode(mode);
      if (!normalizedMode) {
        return res.status(400).json({ message: "Mode is required (online/offline)." });
      }

      if (!classDate || numberOfClasses === undefined) {
        return res
          .status(400)
          .json({ message: "classDate and numberOfClasses are required." });
      }
      const dateValidation = validateNonPastClassDate(classDate);
      if (!dateValidation.ok) {
        return res.status(400).json({ message: dateValidation.message });
      }

      const classDoc = await Classes.findById(classId).select(
        "dailyClasses enrolledStudents"
      );

      if (!classDoc) {
        return res.status(404).json({ message: "Class not found." });
      }

      const assignment = await getAssignmentForTeacher(classId, req.user.userId);
      if (!assignment) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const existingSessionForDate = (classDoc.dailyClasses || []).find(
        (entry) =>
          entry.classDate === classDate &&
          String(entry.teacherId) === String(req.user.userId)
      );
      if (existingSessionForDate) {
        const existingMode =
          normalizeAttendanceMode(existingSessionForDate.mode) || "offline";
        if (existingMode !== normalizedMode) {
          return res.status(409).json({
            message: `Attendance already marked for this date in ${existingMode} mode.`,
          });
        }
      }

      const conflictMatch = buildModeConflictMatch(normalizedMode);
      const conflictingAttendance = await Attendance.exists({
        classId,
        "detailAttendance": {
          $elemMatch: {
            classDate,
            teacherId: req.user.userId,
            ...conflictMatch,
          },
        },
      });
      if (conflictingAttendance) {
        const otherMode = normalizedMode === "online" ? "offline" : "online";
        return res.status(409).json({
          message: `Attendance already marked for this date in ${otherMode} mode.`,
        });
      }

      const normalizedHours = Number(numberOfClasses) || 0;
      const presentSet = new Set(
        (presentStudentIds || []).map((id) => String(id))
      );

      const enrolledStudents = classDoc.enrolledStudents || [];

      if (presentSet.size === 0) {
        const cleanedDailyClasses = (classDoc.dailyClasses || []).filter((d) => {
          const dateMatch = d.classDate === classDate;
          const teacherMatch = String(d.teacherId) === String(req.user.userId);
          const entryMode = normalizeAttendanceMode(d.mode) || "offline";
          const modeMatch = entryMode === normalizedMode;
          return !(dateMatch && teacherMatch && modeMatch);
        });

        if (cleanedDailyClasses.length !== (classDoc.dailyClasses || []).length) {
          classDoc.dailyClasses = cleanedDailyClasses;
          await classDoc.save();
        }

        const modeCriteria =
          normalizedMode === "offline"
            ? {
                $or: [
                  { mode: "offline" },
                  { mode: { $exists: false } },
                  { mode: null },
                  { mode: "" },
                ],
              }
            : { mode: normalizedMode };

        await Attendance.updateMany(
          {
            classId,
            "detailAttendance.classDate": classDate,
            "detailAttendance.teacherId": req.user.userId,
          },
          {
            $pull: {
              detailAttendance: {
                classDate,
                teacherId: req.user.userId,
                ...modeCriteria,
              },
            },
          }
        );

        return res.status(200).json({
          message: "No students present. Class not held.",
          totalStudents: enrolledStudents.length,
          presentCount: 0,
          absentCount: enrolledStudents.length,
        });
      }

      const existingSessionIndex = (classDoc.dailyClasses || []).findIndex(
        (d) =>
          d.classDate === classDate &&
          String(d.teacherId) === String(req.user.userId) &&
          (normalizeAttendanceMode(d.mode) || "offline") === normalizedMode
      );

      if (existingSessionIndex >= 0) {
        classDoc.dailyClasses[existingSessionIndex].numberOfClasses =
          String(normalizedHours);
      } else {
        classDoc.dailyClasses.push({
          classDate,
          numberOfClasses: String(normalizedHours),
          teacherId: req.user.userId,
          mode: normalizedMode,
        });
      }

      await classDoc.save();

      for (const studentId of enrolledStudents) {
        const isPresent = presentSet.has(String(studentId));
        const units = isPresent ? normalizedHours : 0;
        const computedCommission = 0;

        const attendanceDoc = await Attendance.findOne({
          classId,
          studentId,
        });

        if (!attendanceDoc) {
          const newAttendance = new Attendance({
            classId,
            studentId,
            detailAttendance: [
              {
                classDate,
                numberOfClassesTaken: units,
                commission: computedCommission,
                teacherId: req.user.userId,
                mode: normalizedMode,
              },
            ],
          });
          await newAttendance.save();
          await Students.findByIdAndUpdate(studentId, {
            $addToSet: { attendanceDetail: newAttendance._id },
          });
          continue;
        }

        const detail = attendanceDoc.detailAttendance?.find(
          (entry) => {
            const dateMatch = entry.classDate === classDate;
            const teacherMatch =
              String(entry.teacherId) === String(req.user.userId);
            const entryMode = normalizeAttendanceMode(entry.mode) || "offline";
            const modeMatch = entryMode === normalizedMode;
            return dateMatch && teacherMatch && modeMatch;
          }
        );

        if (detail) {
          detail.numberOfClassesTaken = units;
          detail.commission = computedCommission;
          detail.mode = normalizedMode;
        } else {
          attendanceDoc.detailAttendance.push({
            classDate,
            numberOfClassesTaken: units,
            commission: computedCommission,
            teacherId: req.user.userId,
            mode: normalizedMode,
          });
        }

        await attendanceDoc.save();
      }

      res.status(200).json({
        message: "Attendance updated successfully.",
        totalStudents: enrolledStudents.length,
        presentCount: presentSet.size,
        absentCount: enrolledStudents.length - presentSet.size,
      });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error);
    }
  }
);

// ALL STUDENTS IN A CLASS
router.get(
  "/class/all-students/:id",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const assignment = await getAssignmentForTeacher(id, req.user.userId);
      if (!assignment) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const allStudents = await Students.find({ classes: id }, { password: 0 });

      if (!allStudents) {
        return res
          .status(404)
          .json({ message: "No student is enrolled in this course." });
      }

      res.status(200).json(allStudents);
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

// SINGLE STUDENT IN A CLASS
router.get("/student/:id", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const assignments = await ClassTeachers.find({
      teacherId: req.user.userId,
      active: true,
    }).select("classId");
    const classIds = assignments.map((a) => a.classId);

    const student = await Students.findOne(
      { _id: id, classes: { $in: classIds } },
      { password: 0 }
    );

    if (!student) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    res.status(200).json(student);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET MONTHLY COMMISSION REPORT
router.get("/my-commission/:id", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const { classDoc, commissions } = await calculateMonthlyCommission(id, userId);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found." });
    }

    res.status(200).json(sortCommissions(commissions));
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ADD MONTHLY COMMISSION (disabled for teachers)
router.post(
  "/add-monthly-classes/:id",
  TeacherAuthenticateToken,
  async (req, res) => {
    return res.status(403).json({
      message: "Commission is managed by admin. Teachers can only view commission.",
    });
  }
);

//edit commission

router.put(
  "/edit-monthly-classes/:commissionId",
  TeacherAuthenticateToken,
  async (req, res) => {
    return res.status(403).json({
      message: "Commission is managed by admin. Teachers can only view commission.",
    });
  }
);

router.delete(
  "/delete-monthly-classes/:commissionId",
  TeacherAuthenticateToken,
  async (req, res) => {
    return res.status(403).json({
      message: "Commission is managed by admin. Teachers can only view commission.",
    });
  }
);

router.post(
  "/mark-attendance/:studentId/:classId",
  TeacherAuthenticateToken,
  async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classDate, numberOfClassesTaken, grade, mode } = req.body;
    const normalizedMode = normalizeAttendanceMode(mode);
    if (!normalizedMode) {
      return res.status(400).json({ message: "Mode is required (online/offline)." });
    }
    if (!classDate || numberOfClassesTaken === undefined || numberOfClassesTaken === null) {
      return res
        .status(400)
        .json({ message: "Missing classDate or numberOfClassesTaken." });
    }
    const dateValidation = validateNonPastClassDate(classDate);
    if (!dateValidation.ok) {
      return res.status(400).json({ message: dateValidation.message });
    }

    const student = await Students.findById(studentId).populate("classes");

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    

    const classId = req?.params?.classId;

    if(!classId){
      return res.status(404).json({ message: "class not found." });
    }

    const assignment = await getAssignmentForTeacher(classId, req.user.userId);
    if (!assignment) {
      return res.status(403).json({ message: "Unauthorized." });
    }
    const computedCommission = 0;

    const classDoc = await Classes.findById(classId).select("dailyClasses");
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found." });
    }

    const existingSessionForDate = (classDoc.dailyClasses || []).find(
      (entry) =>
        entry.classDate === classDate &&
        String(entry.teacherId) === String(req.user.userId)
    );
    if (existingSessionForDate) {
      const existingMode =
        normalizeAttendanceMode(existingSessionForDate.mode) || "offline";
      if (existingMode !== normalizedMode) {
        return res.status(409).json({
          message: `Attendance already marked for this date in ${existingMode} mode.`,
        });
      }
    }

    const conflictMatch = buildModeConflictMatch(normalizedMode);
    const conflictingAttendance = await Attendance.exists({
      classId,
      "detailAttendance": {
        $elemMatch: {
          classDate,
          teacherId: req.user.userId,
          ...conflictMatch,
        },
      },
    });
    if (conflictingAttendance) {
      const otherMode = normalizedMode === "online" ? "offline" : "online";
      return res.status(409).json({
        message: `Attendance already marked for this date in ${otherMode} mode.`,
      });
    }

    let attendance = await Attendance.findOne({ studentId, classId });

    if (!attendance) {
      attendance = new Attendance({
        studentId,
        classId,
        totalClassesTaken: numberOfClassesTaken,
        detailAttendance: [
          {
            classDate,
            numberOfClassesTaken,
            grade,
            commission: computedCommission,
            teacherId: req.user.userId,
            mode: normalizedMode,
          },
        ],
      });
    } else {
      const existingDetail = attendance.detailAttendance?.find((entry) => {
        const dateMatch = entry.classDate === classDate;
        const teacherMatch =
          String(entry.teacherId) === String(req.user.userId);
        return dateMatch && teacherMatch;
      });

      if (existingDetail) {
        const entryMode = normalizeAttendanceMode(existingDetail.mode) || "offline";
        if (entryMode !== normalizedMode) {
          return res.status(409).json({
            message: `Attendance already marked for this date in ${entryMode} mode.`,
          });
        }
        existingDetail.numberOfClassesTaken = numberOfClassesTaken;
        if (grade !== undefined) {
          existingDetail.grade = grade;
        }
        existingDetail.commission = computedCommission;
        existingDetail.mode = normalizedMode;
      } else {
        attendance.detailAttendance.push({
          classDate,
          numberOfClassesTaken,
          grade,
          commission: computedCommission,
          teacherId: req.user.userId,
          mode: normalizedMode,
        });
      }
    }

    await attendance.save();

    await Students.findByIdAndUpdate(studentId, {
      $addToSet: { attendanceDetail: attendance._id },
    });

    res.status(200).json({
      message: "Attendance marked successfully.",
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while marking attendance." });
  }
});

router.put(
  "/edit-attendance/:studentId/:attendanceEntryId/:classId",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { studentId, attendanceEntryId , classId } = req.params;
      const { classDate, numberOfClassesTaken, grade, mode } = req.body;
      const normalizedMode = normalizeAttendanceMode(mode);
      if (mode !== undefined && normalizedMode === null) {
        return res.status(400).json({ message: "Invalid mode. Use online or offline." });
      }
      if (classDate) {
        const dateValidation = validateNonPastClassDate(classDate);
        if (!dateValidation.ok) {
          return res.status(400).json({ message: dateValidation.message });
        }
      }

      // Find attendance doc by studentId (and other filters if you want)
      const attendance = await Attendance.findOne({ studentId , classId });

      if (!attendance) {
        return res
          .status(404)
          .json({ message: "Attendance record not found." });
      }

      // Find subdocument in detailAttendance array by its _id
      console.log(attendanceEntryId)
      console.log("stu attendance",attendance)
      const attendanceEntry = attendance.detailAttendance.id(attendanceEntryId);
      console.log("asd",attendance.detailAttendance)

      if (!attendanceEntry) {
        return res.status(404).json({ message: "Attendance entry not found." });
      }

      const assignment = await getAssignmentForTeacher(classId, req.user.userId);
      if (!assignment) {
        return res.status(403).json({ message: "Unauthorized." });
      }
      const modeToUse =
        normalizedMode || normalizeAttendanceMode(attendanceEntry.mode) || "offline";
      const computedCommission = 0;

      // Update fields
      if (String(attendanceEntry.teacherId) !== String(req.user.userId)) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      if (classDate) {
        attendanceEntry.classDate = classDate;
      }
      if (numberOfClassesTaken !== undefined && numberOfClassesTaken !== null) {
        attendanceEntry.numberOfClassesTaken = numberOfClassesTaken;
      }
      if (grade !== undefined) {
        attendanceEntry.grade = grade;
      }
      attendanceEntry.commission = computedCommission;
      if (normalizedMode || !attendanceEntry.mode) {
        attendanceEntry.mode = modeToUse;
      }

      await attendance.save();

      res.status(200).json({
        message: "Attendance updated successfully.",
        attendance,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error while editing attendance." });
    }
  }
);

router.get(
  "/download-student-attendance/:studentId",
  TeacherAuthenticateToken,
  async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year, month } = req.query;

    // Fetch student with attendance populated, only courseName from classes
    const student = await Students.findById(studentId)
      .populate("attendanceDetail")
      .populate("classes", "classTitle");

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const classIds = (student.classes || []).map((cls) => cls?._id ?? cls);
    if (classIds.length === 0) {
      return res.status(404).json({ message: "Student has no classes assigned." });
    }

    const assignment = await ClassTeachers.findOne({
      teacherId: req.user.userId,
      classId: { $in: classIds },
      active: true,
    });
    if (!assignment) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const attendanceRecords = student.attendanceDetail || [];
    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    const detailAttendance = attendanceRecords.flatMap((record) =>
      (record?.detailAttendance || []).map((entry) => {
        const normalizedEntry = entry?.toObject ? entry.toObject() : entry;
        return {
          ...normalizedEntry,
          classId: record.classId,
        };
      })
    );

    const filterYear = year ? Number(year) : null;
    const filterMonth = month ? Number(month) : null;
    if (year && !Number.isInteger(filterYear)) {
      return res.status(400).json({ message: "Invalid year filter." });
    }
    if (month && (!Number.isInteger(filterMonth) || filterMonth < 1 || filterMonth > 12)) {
      return res.status(400).json({ message: "Invalid month filter." });
    }

    const filteredAttendance = detailAttendance
      .filter((entry) => String(entry.teacherId) === String(req.user.userId))
      .filter((entry) => {
        const parsed = parseClassDate(entry?.classDate);
        if (!parsed) {
          return !filterYear && !filterMonth;
        }
        if (filterYear && parsed.year !== filterYear) return false;
        if (filterMonth && parsed.month !== filterMonth) return false;
        return true;
      });

    const totalClasses = filteredAttendance.reduce((sum, entry) => {
      return sum + parseFloat(entry.numberOfClassesTaken || 0);
    }, 0);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: "left" },
    };

    worksheet.addRow(["Student Name", student.name]).eachCell((cell) => {
      cell.font = { bold: true };
    });
    worksheet.addRow(["Phone", student.phone]).eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRow(["Grade", student.grade]).eachCell((cell) => {
      cell.font = { bold: true };
    });
    worksheet
      .addRow([
        "Course(s)",
        student.classes.length > 0
          ? student.classes.map((cls) => cls.classTitle || cls._id).join(", ")
          : "N/A",
      ])
      .eachCell((cell) => {
        cell.font = { bold: true };
      });

    worksheet
      .addRow(["Total Classes This Month", totalClasses])
      .eachCell((cell) => {
        cell.font = { bold: true };
      });

    worksheet.addRow([]);

    // Table header row
    const headerRow = worksheet.addRow([
      "Class Date",
      "Number of Hours",
      // "Grade",
    ]);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF9BC2E6" },
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center" };
    });

    // Add attendance rows
    filteredAttendance.forEach((entry) => {
      const row = worksheet.addRow([
        entry.classDate,
        entry.numberOfClassesTaken,
        // entry.grade,
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Add TOTAL row
    const totalRow = worksheet.addRow(["TOTAL", totalClasses]);

    totalRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFF176" }, // Light Yellow background
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Send the file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_${student.name}_${year || "all"}_${
        month || "all"
      }.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({ message: "Failed to generate attendance report." });
  }
});

//deactivate student

router.put(
  "/deactivate-account/:id",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const normalizedStatus =
        status === true || status === "true"
          ? true
          : status === false || status === "false"
          ? false
          : null;

      if (normalizedStatus === null) {
        return res.status(400).json({
          message: "Invalid status. Use true or false.",
        });
      }

      await Students.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          $set: { deactivated: normalizedStatus },
        }
      );

      res
        .status(201)
        .json({ message: "Deactivation status got updated successfully!!!" });
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

export default router;
