import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Admin from "../Models/Admin.js";
import AdminAuthenticateToken from "../Middlewares/AdminAuthenticateToken.js";
import Classes from "../Models/Classes.js";
import Teachers from "../Models/Teachers.js";
import Students from "../Models/Students.js";
import Fee from "../Models/Fee.js";
import Invoice from "../Models/Invoice.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import Attendance from "../Models/Attendance.js";
import Commission from "../Models/Commission.js";
import ClassTeachers from "../Models/ClassTeachers.js";
import PaymentRequest from "../Models/PaymentRequest.js";
import { calculateMonthlyCommission, sortCommissions } from "../utils/commission.js";
import { deriveGradeFromText, isGradeMatch, resolveCourseGrade, toGradeLabel } from "../utils/grade.js";
import { normalizeCommissionRateValue } from "../utils/classTeachers.js";
import { generateInvoiceNumber, generateInvoicePdfBuffer } from "../services/invoiceService.js";
import { sendEmail } from "../services/emailService.js";
import { createNotification } from "../services/notificationService.js";
import { createRefreshTokenRecord, setAccessCookie, setRefreshCookie, signAccessToken } from "../utils/authTokens.js";
import { deleteAllCoursesCascade } from "../utils/deleteCourseCascade.js";
import { deleteAllStudentsCascade, deleteStudentCascade } from "../utils/deleteStudentCascade.js";
import {
  normalizeFeeMonth,
  normalizeFeeMonths,
  normalizeFeeYear,
  normalizePaidStatus,
  parseFeeAmount,
  formatFeePeriodLabel,
  computePaymentState,
} from "../utils/fee.js";
import {
  findStudentUniquenessConflict,
  isValidEmail,
  normalizeEmail,
} from "../utils/studentValidation.js";
import { isValidPhone, normalizePhone } from "../utils/phone.js";
import ExcelJS from "exceljs";
dotenv.config();

const router = express.Router();

const normalizeRateInput = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return normalizeCommissionRateValue(value);
};

const parseCommissionValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return { ok: false, value: null };
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { ok: false, value: null };
  }
  return { ok: true, value: parsed };
};

const parseClassDateParts = (dateStr = "") => {
  const parts = String(dateStr).split("-").map((part) => part.trim());
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

const validateCommissionPair = (offlineCommissionRate, onlineCommissionRate) => {
  const offline = parseCommissionValue(offlineCommissionRate);
  const online = parseCommissionValue(onlineCommissionRate);
  if (!offline.ok || !online.ok) {
    return {
      ok: false,
      message:
        "Offline and online commission rates are required and must be non-negative numbers.",
    };
  }
  return { ok: true, offline: offline.value, online: online.value };
};

const buildCommissionRates = ({
  commissionRate,
  offlineCommissionRate,
  onlineCommissionRate,
}) => {
  const legacy = normalizeRateInput(commissionRate);
  const offline = normalizeRateInput(offlineCommissionRate);
  const online = normalizeRateInput(onlineCommissionRate);

  const resolvedOffline = offline ?? legacy ?? 0;
  const resolvedOnline = online ?? legacy ?? 0;
  const resolvedLegacy = legacy ?? resolvedOffline ?? resolvedOnline ?? 0;

  return {
    legacy,
    offline,
    online,
    resolvedLegacy,
    resolvedOffline,
    resolvedOnline,
  };
};

const ensureAdminSignupAllowed = async (req, res, next) => {
  try {
    const hasAdmin = await Admin.exists({});
    if (!hasAdmin) {
      const setupToken = process.env.ADMIN_SETUP_TOKEN;
      const provided =
        req.headers["x-admin-setup-token"] || req.body?.setupToken;
      if (!setupToken) {
        return res.status(503).json({
          message: "Admin signup is disabled. Configure ADMIN_SETUP_TOKEN.",
        });
      }
      if (provided !== setupToken) {
        return res.status(403).json({ message: "Unauthorized admin signup." });
      }
      return next();
    }
    return AdminAuthenticateToken(req, res, next);
  } catch (error) {
    console.error("Admin signup guard failed:", error);
    return res.status(500).json({ message: "Unable to process signup." });
  }
};



router.post("/signup-admin", ensureAdminSignupAllowed, async (req, res) => {
  try {
    const { name, phone, password, email } = req.body;
    if (!name || !phone || !password || !email) {
      return res.status(400).json({
        message: "Name, phone number, email, and password are required.",
      });
    }
    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits." });
    }
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    const adminuser = await Admin.findOne({
      $or: [{ phone: normalizedPhone }, { email: normalizedEmail }],
    });
    if (adminuser) {
      return res.status(409).json({ message: "Admin user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      role: "admin",
      name,
      username: name + "-" + normalizedPhone,
      phone: normalizedPhone,
      email: normalizedEmail,
      branch: "Main",
      password: hashedPassword,
    });

    await newAdmin.save();

    return res
      .status(201)
      .json({ message: "Admin User created successfully", newAdmin });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.post("/login-admin", async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const rawIdentifier = identifier || email || username;
    if (!rawIdentifier || !password) {
      return res.status(400).json({
        message: "Email or username and password are required.",
      });
    }

    const normalizedEmail = normalizeEmail(rawIdentifier);
    let user = null;
    if (isValidEmail(normalizedEmail)) {
      user = await Admin.findOne({ email: normalizedEmail });
    }
    if (!user) {
      user = await Admin.findOne({ username: rawIdentifier });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or username" });
    }

    // Compare the passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const accessPayload = {
      userId: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role || "admin",
    };
    const token = signAccessToken(accessPayload, "admin");
    const refreshToken = await createRefreshTokenRecord({
      userId: user._id,
      role: "admin",
    });
    setAccessCookie(res, token);
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({ token });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.get("/my-profile", AdminAuthenticateToken, async (req, res) => {
  try {
    const { phone } = req.user;

    const admin = await Admin.findOne({ phone: phone });

    if (!admin) {
      return res.status(404).json({ message: "Admin not find" });
    }

    const { role, name, username, parents, teachers, classes } = admin;
    res.status(200).json({
      role,
      name,
      username,
      phone,
      parents,
      teachers,
      classes,
    });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.put("/student-edit/:id", AdminAuthenticateToken, async (req, res) => {
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


router.put("/teacher-edit/:id", AdminAuthenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, phone, password, dob, courseId, email } = req.body;

  try {
    if (courseId) {
      return res.status(400).json({
        message:
          "Assign courses to teachers from the course screen and set offline/online commission there.",
      });
    }
    // Validate input fields (optional, depending on your requirements)

    // Find the student by ID
    const teacher = await Teachers.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "teacher not found." });
    }

    // Check if phone already exists (excluding the current teacher)
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({ message: "Phone number must be 10 digits." });
      }
      const existingTeacher = await Teachers.findOne({ phone: normalizedPhone });
      if (existingTeacher && existingTeacher._id.toString() !== id) {
        return res.status(400).json({
          message: "Teacher already taken. Please enter a unique phone number",
        });
      }
    }

    if (email) {
      const normalizedEmail = normalizeEmail(email);
      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Please enter a valid email." });
      }
      const existingTeacher = await Teachers.findOne({ email: normalizedEmail });
      if (existingTeacher && existingTeacher._id.toString() !== id) {
        return res.status(400).json({
          message: "Email already exists. Please enter a unique email address.",
        });
      }
      teacher.email = normalizedEmail;
    }


    if (name) {
      teacher.name = name;
    }
    if (phone) {
      teacher.phone = normalizePhone(phone);
    }
    if (dob) {
      teacher.dob = dob;
    }


    // If password is provided, hash it and update the password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      teacher.password = await bcrypt.hash(password, salt);
    }

    // Save the updated student details
    await teacher.save();

    // Send a success response
    res.status(200).json({ message: "teacher details updated successfully." });
  } catch (error) {
    console.error("Error updating teacher details:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// EDIT COURSE
router.put("/course-edit/:id", AdminAuthenticateToken, async (req, res) => {
  const { id } = req.params;
  const { classTitle, classSchedule, totalHours, grade } = req.body;

  try {
    const course = await Classes.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (classTitle !== undefined) {
      course.classTitle = classTitle;
    }
    if (classSchedule !== undefined) {
      course.classSchedule = classSchedule;
    }
    if (totalHours !== undefined) {
      course.totalHours = totalHours;
    }

    if (grade !== undefined) {
      const gradeLabel = toGradeLabel(grade);
      const resolvedGrade =
        gradeLabel || deriveGradeFromText(classTitle || course.classTitle);
      if (!resolvedGrade) {
        return res.status(400).json({ message: "Grade is required for a class." });
      }
      course.grade = resolvedGrade;
    } else if (!course.grade) {
      const inferred = resolveCourseGrade(course);
      if (inferred) {
        course.grade = inferred;
      }
    }

    await course.save();

    return res
      .status(200)
      .json({ message: "Course updated successfully.", course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// CLASS TEACHERS (ASSIGNMENTS)
router.get("/class-teachers/:classId", AdminAuthenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const course = await Classes.findById(classId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const assignments = await ClassTeachers.find({
      classId,
      active: true,
    }).populate({ path: "teacherId", select: "-password" });

    return res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching class teachers:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/class-teachers/:classId", AdminAuthenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const { teacherId, commissionRate, offlineCommissionRate, onlineCommissionRate } = req.body;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher is required." });
    }

    const commissionValidation = validateCommissionPair(
      offlineCommissionRate,
      onlineCommissionRate
    );
    if (!commissionValidation.ok) {
      return res.status(400).json({ message: commissionValidation.message });
    }

    const course = await Classes.findById(classId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const teacher = await Teachers.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    const existing = await ClassTeachers.findOne({ classId, teacherId });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
      }
      const rates = buildCommissionRates({
        commissionRate,
        offlineCommissionRate,
        onlineCommissionRate,
      });
      if (rates.legacy !== null) {
        existing.commissionRate = rates.resolvedLegacy;
      }
      if (rates.offline !== null || rates.legacy !== null) {
        existing.offlineCommissionRate = rates.resolvedOffline;
      }
      if (rates.online !== null || rates.legacy !== null) {
        existing.onlineCommissionRate = rates.resolvedOnline;
      }
      await existing.save();
      return res.status(200).json(existing);
    }

    const rates = buildCommissionRates({
      commissionRate,
      offlineCommissionRate,
      onlineCommissionRate,
    });
    const assignment = new ClassTeachers({
      classId,
      teacherId,
      commissionRate: rates.resolvedLegacy,
      offlineCommissionRate: rates.resolvedOffline,
      onlineCommissionRate: rates.resolvedOnline,
    });
    await assignment.save();
    const populated = await assignment.populate({ path: "teacherId", select: "-password" });
    return res.status(200).json(populated);
  } catch (error) {
    console.error("Error assigning teacher:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.put("/class-teachers/:assignmentId", AdminAuthenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { commissionRate, offlineCommissionRate, onlineCommissionRate, active } = req.body;

    const assignment = await ClassTeachers.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    const hasCommissionUpdate =
      commissionRate !== undefined ||
      offlineCommissionRate !== undefined ||
      onlineCommissionRate !== undefined;
    if (hasCommissionUpdate) {
      const commissionValidation = validateCommissionPair(
        offlineCommissionRate,
        onlineCommissionRate
      );
      if (!commissionValidation.ok) {
        return res.status(400).json({ message: commissionValidation.message });
      }
    }

    const rates = buildCommissionRates({
      commissionRate,
      offlineCommissionRate,
      onlineCommissionRate,
    });
    if (rates.legacy !== null) {
      assignment.commissionRate = rates.resolvedLegacy;
    }
    if (rates.offline !== null || rates.legacy !== null) {
      assignment.offlineCommissionRate = rates.resolvedOffline;
    }
    if (rates.online !== null || rates.legacy !== null) {
      assignment.onlineCommissionRate = rates.resolvedOnline;
    }
    if (active !== undefined) {
      assignment.active = Boolean(active);
    }
    await assignment.save();
    const populated = await assignment.populate({ path: "teacherId", select: "-password" });
    return res.status(200).json(populated);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.delete("/class-teachers/:assignmentId", AdminAuthenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await ClassTeachers.findByIdAndDelete(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }
    return res.status(200).json({ message: "Assignment removed." });
  } catch (error) {
    console.error("Error removing assignment:", error);
    res.status(500).json({ message: "Server error." });
  }
});



// ADD CLASS BY ADMIN
router.post("/add-new-class", AdminAuthenticateToken, async (req, res) => {
  try {
    const { phone } = req.user;
    const branch = "Main";
    const {
      classTitle,
      classSchedule,
      teacherId,
      totalHours,
      commissionRate,
      offlineCommissionRate,
      onlineCommissionRate,
      grade,
    } = req.body;

    const admin = await Admin.findOne({ phone: phone });

    if (!admin) {
      return res.status(404).json({ message: "Admin not find" });
    }
    const gradeLabel = toGradeLabel(grade);
    const resolvedGrade = gradeLabel || deriveGradeFromText(classTitle);
    if (!resolvedGrade) {
      return res.status(400).json({ message: "Grade is required for a class." });
    }

    const newClass = new Classes({
      branch,
      classTitle,
      classSchedule,
      totalHours,
      grade: resolvedGrade,
    });

    await newClass.save();

    let assignment = null;
    if (teacherId) {
      const commissionValidation = validateCommissionPair(
        offlineCommissionRate,
        onlineCommissionRate
      );
      if (!commissionValidation.ok) {
        return res.status(400).json({ message: commissionValidation.message });
      }
      const teacher = await Teachers.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found." });
      }
      const rates = buildCommissionRates({
        commissionRate,
        offlineCommissionRate,
        onlineCommissionRate,
      });
      assignment = new ClassTeachers({
        classId: newClass._id,
        teacherId,
        commissionRate: rates.resolvedLegacy,
        offlineCommissionRate: rates.resolvedOffline,
        onlineCommissionRate: rates.resolvedOnline,
      });
      await assignment.save();
    }

    return res
      .status(200)
      .json({
        message: "new class has added!!!",
        newClass: { ...newClass.toObject(), teachers: assignment ? [assignment] : [] },
      });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET ALL CLASSES
router.get("/all-classes", AdminAuthenticateToken, async (req, res) => {
  try {
    console.log("=== ADMIN ALL-CLASSES DEBUG ===");
    const allClasses = await Classes.find({})
      .select(
        "classTitle totalHours grade enrolledStudents appliedStudents dailyClasses createdAt"
      )
      .lean();
    const gradeBackfills = [];
    const normalizedClasses = allClasses.map((course) => {
      if (course?.grade) return course;
      const inferred = resolveCourseGrade(course);
      if (inferred) {
        gradeBackfills.push({ id: course._id, grade: inferred });
        return { ...course, grade: inferred };
      }
      return course;
    });
    if (gradeBackfills.length > 0) {
      await Promise.all(
        gradeBackfills.map((item) =>
          Classes.findByIdAndUpdate(
            item.id,
            { $set: { grade: item.grade } },
            { new: false }
          )
        )
      );
    }
    const classIds = normalizedClasses.map((c) => c._id);
    const assignments = await ClassTeachers.find({
      classId: { $in: classIds },
      active: true,
    }).populate({ path: "teacherId", select: "-password" });
    const assignmentsByClass = assignments.reduce((acc, assignment) => {
      const key = String(assignment.classId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(assignment);
      return acc;
    }, {});

    const responseClasses = normalizedClasses.map((course) => ({
      ...course,
      teachers: assignmentsByClass[String(course._id)] || [],
    }));

    console.log("Courses found for admin:", responseClasses.length);
    console.log("================================");

    return res.status(200).json(responseClasses);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET CLASSES BY TEACHER
router.get("/teacher-classes/:teacherId", AdminAuthenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const assignments = await ClassTeachers.find({
      teacherId,
      active: true,
    }).select("classId");
    const classIds = assignments.map((a) => a.classId);

    const query = { _id: { $in: classIds } };
    const classes = await Classes.find(query);
    return res.status(200).json(classes);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET CLASS BY ID
router.get("/all-classes/:id", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const singleClass = await Classes.findById(id);
    if (!singleClass) {
      return res
        .status(404)
        .json({ message: "Course not found." });
    }
    if (!singleClass.grade) {
      const inferred = resolveCourseGrade(singleClass);
      if (inferred) {
        singleClass.grade = inferred;
        await singleClass.save();
      }
    }

    const teachers = await ClassTeachers.find({
      classId: singleClass._id,
      active: true,
    }).populate({ path: "teacherId", select: "-password" });

    return res.status(200).json({ ...singleClass.toObject(), teachers });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ADD TEACHER
router.post("/add-teacher", AdminAuthenticateToken, async (req, res) => {
  try {
    const {
      name,
      phone,
      password,
      dob,
      email,
      courseId,
      commissionRate,
      offlineCommissionRate,
      onlineCommissionRate,
    } = req.body;

    if (!name || !phone || !password || !email) {
      return res.status(400).json({
        message: "Name, phone number, email, and password are required.",
      });
    }

    if (
      courseId ||
      commissionRate !== undefined ||
      offlineCommissionRate !== undefined ||
      onlineCommissionRate !== undefined
    ) {
      return res.status(400).json({
        message:
          "Assign courses to teachers from the course screen and set offline/online commission there.",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        message: "Phone number must be 10 digits.",
      });
    }

    const teacher = await Teachers.exists({
      $or: [{ phone: normalizedPhone }, { email: normalizedEmail }],
    });

    if (teacher) {
      return res
        .status(409)
        .json({ message: "Teacher has already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new Teachers({
      branch: "Main",
      role: "teacher",
      name,
      phone: normalizedPhone,
      email: normalizedEmail,
      dob,
      password: hashedPassword,
    });

    await newTeacher.save();
    return res
      .status(200)
      .json({ message: "new teacher has added!!!", newTeacher });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

//All admin

router.get("/all-admin", AdminAuthenticateToken, async (req, res) => {
  try {
    const admin = await Admin.find({}, { password: 0 });
    return res.status(200).json(admin);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch admins." });
  }
});

router.delete("/delete-admin/:id", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdminExist = await Admin.findByIdAndDelete(id);
    if (!isAdminExist) {
      return res.status(404).json({ message: "Admin not found." });
    }
    return res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to delete admin." });
  }
});

router.put("/edit-admin/:id", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, password } = req.body;
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found!" });
      }

      const updatedName = name || admin.name;
      const normalizedPhone = phone ? normalizePhone(phone) : admin.phone;
      if (phone && !isValidPhone(normalizedPhone)) {
        return res.status(400).json({ message: "Phone number must be 10 digits." });
      }
      const updatedPhone = normalizedPhone;


    const username = `${updatedName}-${updatedPhone}`;
    const isUserNameExist = await Admin.findOne({
      _id: { $ne: id },
      username,
    });

    if (isUserNameExist) {
      return res.status(400).json({
        message: "Username already taken. Please enter a unique username.",
      });
    }

    if (name) admin.name = name;
      if (phone) admin.phone = normalizedPhone;
    admin.username = username;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.status(200).json({ message: "Admin updated successfully!", admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

// GET ALL TEACHERS
router.get("/all-teachers", AdminAuthenticateToken, async (req, res) => {
  try {
    const allTeachers = await Teachers.find({}, { password: 0 });

    return res.status(200).json(allTeachers);
  } catch (error) {
    console.log("Something went wrong!!! ", error);
    res.status(500).json(error);
  }
});

// GET TEACHER BY ID
router.get("/all-teachers/:id", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const singleTeacher = await Teachers.findById({ _id: id }, { password: 0 });

    if (!singleTeacher) {
      return res.status(409).json({ message: "Teacher not found!!!" });
    }

    return res.status(200).json(singleTeacher);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ADD STUDENT
router.post("/add-student", AdminAuthenticateToken, async (req, res) => {
  try {
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

    if (courseId) {
      classData = await Classes.findOne({ _id: courseId });
      if (!classData) {
        return res
          .status(404)
          .json({ message: "Class not found or unauthorized." });
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Students({
      branch: "Main",
      userName: normalizedUserName,
      dob,
      name,
      phone: normalizedPhone,
      email: normalizedEmail,
      grade: gradeLabel,
      password: hashedPassword,
      classes: [],
    });

    await newStudent.save();

    return res.status(200).json({
      message: "New student has been registered successfully!!!",
      studentId: newStudent._id,
      student: newStudent,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Username, phone number, or email already exists.",
      });
    }
    console.log("Something went wrong!!! ", error.message);
    res.status(500).json(error);
  }
});

// GET ALL STUDENTS
router.get("/all-students", AdminAuthenticateToken, async (req, res) => {
  try {
    const allStudents = await Students.find({}, { password: 0 });

    return res.status(200).json(allStudents);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET STUDENT BY ID
router.get("/all-students/:id", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const singleStudent = await Students.findById({ _id: id }, { password: 0 });

    return res.status(200).json(singleStudent);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ENROLL STUDENT IN A COURSE
router.put("/enroll-student/:id1/:id2", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id1, id2 } = req.params;
    const { totalFee, feeMonth, feeYear, paid, amountPaid } = req.body;
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

    const normalizedFeeMonth = normalizeFeeMonth(feeMonth);
    if (!normalizedFeeMonth) {
      return res.status(400).json({
        message: "Fee month must be a valid month number (1-12).",
      });
    }
    const providedYear = normalizeFeeYear(feeYear);
    if (feeYear !== undefined && feeYear !== null && feeYear !== "" && !providedYear) {
      return res.status(400).json({
        message: "Fee year must be a valid year (e.g., 2026).",
      });
    }
    const normalizedFeeYear = providedYear || new Date().getFullYear();

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
    if (normalizedAmountPaid > normalizedTotalFee) {
      return res.status(400).json({
        message: "Amount paid cannot exceed total fee.",
      });
    }

    const paymentState = computePaymentState(
      normalizedTotalFee,
      normalizedAmountPaid
    );
    const effectivePaid = paymentState.isPaid;
    const paymentStatus = paymentState.status;
    const hasPayment = normalizedAmountPaid > 0;

    const classExists = await Classes.findById(id1);
    if (!classExists) {
      return res.status(404).json({ message: "Class not found." });
    }

    const studentExists = await Students.findById(id2);
    if (!studentExists) {
      return res.status(404).json({ message: "Student not found." });
    }
    const alreadyInStudent = (studentExists.classes || []).some(
      (classId) => String(classId) === String(id1)
    );
    if (alreadyInStudent) {
      return res.status(409).json({
        message: "Student already exists in this class!!!",
      });
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
      const invoiceYearMatch =
        normalizedFeeYear === currentYear
          ? { $in: [normalizedFeeYear, null] }
          : normalizedFeeYear;
      const resolveDetailYear = (detail) => {
        const yearValue = normalizeFeeYear(detail?.feeYear);
        if (yearValue) return yearValue;
        return normalizedFeeYear === currentYear ? currentYear : null;
      };
      const existingDetail = feeRecord.detailFee.find(
        (detail) =>
          normalizeFeeMonth(detail.feeMonth) === normalizedFeeMonth &&
          resolveDetailYear(detail) === normalizedFeeYear
      );
      const wasPaid = existingDetail?.paid === true;

      if (existingDetail) {
        existingDetail.paid = effectivePaid;
        existingDetail.amountPaid = normalizedAmountPaid ?? 0;
        existingDetail.feeYear = normalizedFeeYear;
      } else {
        feeRecord.detailFee.push({
          feeMonth: normalizedFeeMonth,
          feeYear: normalizedFeeYear,
          paid: effectivePaid,
          amountPaid: normalizedAmountPaid ?? 0,
        });
      }

      feeRecord.totalFee = normalizedTotalFee;
      await feeRecord.save();

      // UPDATE STUDENT
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
          $pull: { appliedStudents: id2 }, // Removing from appliedStudents
        },
        { new: true }
      );

      if (hasPayment) {
        const studentEmail = studentExists.email;
        const issuedAt = new Date();
        const invoiceYearMatch =
          normalizedFeeYear === currentYear
            ? { $in: [normalizedFeeYear, null] }
            : normalizedFeeYear;
        let invoiceRecord = await Invoice.findOne({
          feeId: feeRecord._id,
          feeMonth: normalizedFeeMonth,
          feeYear: invoiceYearMatch,
          studentId: id2,
        });

        if (!(invoiceRecord?.emailStatus === "sent" && wasPaid)) {
          let invoiceNumber = invoiceRecord?.invoiceNumber;
          if (!invoiceRecord) {
            invoiceNumber = generateInvoiceNumber(issuedAt);
            try {
              invoiceRecord = await Invoice.create({
                invoiceNumber,
                classId: id1,
                studentId: id2,
                feeId: feeRecord._id,
                feeMonth: normalizedFeeMonth,
                feeYear: normalizedFeeYear,
                totalFee: normalizedTotalFee,
                amountPaid: normalizedAmountPaid ?? 0,
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
                  feeMonth: normalizedFeeMonth,
                  feeYear: normalizedFeeYear,
                  totalFee: normalizedTotalFee,
                  amountPaid: normalizedAmountPaid ?? 0,
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
                  feeMonth: normalizedFeeMonth,
                  feeYear: normalizedFeeYear,
                  totalFee: normalizedTotalFee,
                  amountPaid: normalizedAmountPaid ?? 0,
                  currency: process.env.INVOICE_CURRENCY || "INR",
                });

              const feeMonthLabel = formatFeePeriodLabel(normalizedFeeMonth, normalizedFeeYear);
              const subject = `Invoice ${invoiceRecord.invoiceNumber} for ${classExists.classTitle}`;
              const text = `Hi ${studentExists.name},\n\nThank you for your payment. Please find your invoice (${invoiceRecord.invoiceNumber}) attached.\n\nCourse: ${classExists.classTitle}\nFee Month: ${feeMonthLabel}\nTotal Fee: ${normalizedTotalFee}\nAmount Paid: ${normalizedAmountPaid}\n\nRegards,\nMentor Language Institute`;
              const html = `
              <div style="font-family:Arial, sans-serif; line-height:1.6; color:#111;">
                <p>Hi ${studentExists.name},</p>
                <p>Thank you for your payment. Please find your invoice attached.</p>
                <p><strong>Invoice:</strong> ${invoiceRecord.invoiceNumber}</p>
                <p><strong>Course:</strong> ${classExists.classTitle}<br/>
                <strong>Fee Month:</strong> ${feeMonthLabel}<br/>
                <strong>Total Fee:</strong> ${normalizedTotalFee}<br/>
                <strong>Amount Paid:</strong> ${normalizedAmountPaid}</p>
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
      const feeMonthLabel = formatFeePeriodLabel(normalizedFeeMonth, normalizedFeeYear);
      const title = `Enrolled in ${classExists.classTitle}`;
      const message =
        paymentStatus === "paid"
          ? `You have been enrolled in ${classExists.classTitle}. Payment received for ${feeMonthLabel} and invoice sent.`
          : paymentStatus === "partial"
            ? `You have been enrolled in ${classExists.classTitle}. Partial payment received for ${feeMonthLabel}. Remaining balance is pending.`
            : `You have been enrolled in ${classExists.classTitle}. Payment is pending for ${feeMonthLabel}.`;
      await createNotification({
        userId: studentExists._id,
        role: "student",
        type: "COURSE_ENROLLED",
        title,
        message,
        classId: classExists._id,
        feeMonth: normalizedFeeMonth,
        feeYear: normalizedFeeYear,
        payload: {
          classTitle: classExists.classTitle,
          feeMonth: normalizedFeeMonth,
          feeYear: normalizedFeeYear,
          paid: effectivePaid,
          amountPaid: normalizedAmountPaid ?? 0,
          paymentStatus,
        },
      });
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
});

// PAYMENT REQUESTS
router.get(
  "/payment-requests",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { status, requestType } = req.query;
      const query = {};
      if (status) {
        query.status = String(status).toLowerCase();
      }
      if (requestType) {
        query.requestType = String(requestType).toLowerCase();
      }

      const requests = await PaymentRequest.find(query)
        .sort({ createdAt: -1 })
        .populate("studentId", "name email phone userName grade branch")
        .populate("classId", "classTitle grade totalHours branch");

      res.status(200).json(requests);
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json({ message: "Failed to fetch payment requests." });
    }
  }
);

router.put(
  "/payment-requests/:id/approve",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { totalFee, feeMonth, feeYear, amountPaid } = req.body || {};

      const request = await PaymentRequest.findById(id);
      if (!request) {
        return res.status(404).json({ message: "Payment request not found." });
      }
      if (request.status !== "pending") {
        return res
          .status(409)
          .json({ message: "Payment request already processed." });
      }

      const classExists = await Classes.findById(request.classId);
      if (!classExists) {
        return res.status(404).json({ message: "Class not found." });
      }

      const studentExists = await Students.findById(request.studentId);
      if (!studentExists) {
        return res.status(404).json({ message: "Student not found." });
      }
      const alreadyInStudent = (studentExists.classes || []).some(
        (classId) => String(classId) === String(request.classId)
      );

      const alreadyEnrolled = await Classes.findOne({
        _id: request.classId,
        enrolledStudents: request.studentId,
      });

      const isFeePaymentRequest = request.requestType === "fee_payment";
      const isEnrolled = alreadyInStudent || !!alreadyEnrolled;
      const treatAsFeePayment = isFeePaymentRequest || isEnrolled;

      if (isFeePaymentRequest && !isEnrolled) {
        return res.status(400).json({
          message: "Student must be enrolled to submit a fee payment request.",
        });
      }

      if (!treatAsFeePayment) {
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
      }

      const hasPayment =
        amountPaid !== undefined && amountPaid !== null && amountPaid !== ""
          ? Number(amountPaid) > 0
          : Number(request.amount) > 0;
      if (hasPayment && !studentExists.email) {
        return res.status(400).json({
          message: "Student email is required to send the invoice.",
        });
      }

      const fallbackMonth = request.paidOn
        ? request.paidOn.getMonth() + 1
        : null;
      const normalizedFeeMonth = normalizeFeeMonth(
        feeMonth ?? fallbackMonth
      );
      if (!normalizedFeeMonth) {
        return res.status(400).json({
          message: "Fee month must be a valid month number (1-12).",
        });
      }
      const fallbackYear = request.paidOn
        ? request.paidOn.getFullYear()
        : null;
      const providedYear = normalizeFeeYear(feeYear ?? request.feeYear ?? fallbackYear);
      if (feeYear !== undefined && feeYear !== null && feeYear !== "" && !providedYear) {
        return res.status(400).json({
          message: "Fee year must be a valid year (e.g., 2026).",
        });
      }
      const normalizedFeeYear = providedYear || new Date().getFullYear();

      const normalizedTotalFee =
        totalFee !== undefined && totalFee !== null && totalFee !== ""
          ? parseFeeAmount(totalFee)
          : parseFeeAmount(request.amount);
      if (normalizedTotalFee === null || normalizedTotalFee <= 0) {
        return res.status(400).json({
          message: "Total fee must be a valid number greater than zero.",
        });
      }

      const normalizedAmountPaid =
        amountPaid !== undefined && amountPaid !== null && amountPaid !== ""
          ? parseFeeAmount(amountPaid)
          : parseFeeAmount(request.amount);
      if (normalizedAmountPaid === null || normalizedAmountPaid < 0) {
        return res.status(400).json({
          message: "Amount paid must be a valid number.",
        });
      }
      if (normalizedAmountPaid > normalizedTotalFee) {
        return res.status(400).json({
          message: "Amount paid cannot exceed total fee.",
        });
      }

      const paymentState = computePaymentState(
        normalizedTotalFee,
        normalizedAmountPaid
      );
      const effectivePaid = paymentState.isPaid;
      const paymentStatus = paymentState.status;

      const updateClass = treatAsFeePayment
        ? null
        : await Classes.findByIdAndUpdate(
          { _id: request.classId },
          {
            $addToSet: { enrolledStudents: request.studentId },
            $pull: { appliedStudents: request.studentId },
          },
          { new: true }
        );

      if (updateClass || treatAsFeePayment) {
        if (updateClass) {
          await ClassAccessStatus.findOneAndUpdate(
            { classId: request.classId, studentId: request.studentId },
            { classAccessStatus: true },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }

        let feeRecord = await Fee.findOne({
          classId: request.classId,
          studentId: request.studentId,
        });
        if (!feeRecord) {
          feeRecord = new Fee({
            classId: request.classId,
            studentId: request.studentId,
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
        const existingDetail = feeRecord.detailFee.find(
          (detail) =>
            normalizeFeeMonth(detail.feeMonth) === normalizedFeeMonth &&
            resolveDetailYear(detail) === normalizedFeeYear
        );
        const wasPaid = existingDetail?.paid === true;

        if (existingDetail) {
          existingDetail.paid = effectivePaid;
          existingDetail.amountPaid = normalizedAmountPaid ?? 0;
          existingDetail.feeYear = normalizedFeeYear;
        } else {
          feeRecord.detailFee.push({
            feeMonth: normalizedFeeMonth,
            feeYear: normalizedFeeYear,
            paid: effectivePaid,
            amountPaid: normalizedAmountPaid ?? 0,
          });
        }

        feeRecord.totalFee = normalizedTotalFee;
        await feeRecord.save();

        if (updateClass) {
          await Students.findByIdAndUpdate(
            { _id: request.studentId },
            {
              $addToSet: { classes: request.classId, feeDetail: feeRecord._id },
              $pull: { appliedClasses: request.classId },
            },
            { new: true }
          );
        } else {
          await Students.findByIdAndUpdate(
            { _id: request.studentId },
            { $addToSet: { feeDetail: feeRecord._id } },
            { new: true }
          );
        }

        if (hasPayment) {
          const studentEmail = studentExists.email;
          const issuedAt = new Date();
        const invoiceYearMatch =
          normalizedFeeYear === currentYear
            ? { $in: [normalizedFeeYear, null] }
            : normalizedFeeYear;
        let invoiceRecord = await Invoice.findOne({
          feeId: feeRecord._id,
          feeMonth: normalizedFeeMonth,
          feeYear: invoiceYearMatch,
          studentId: request.studentId,
        });

          if (!(invoiceRecord?.emailStatus === "sent" && wasPaid)) {
            let invoiceNumber = invoiceRecord?.invoiceNumber;
            if (!invoiceRecord) {
              invoiceNumber = generateInvoiceNumber(issuedAt);
              try {
                invoiceRecord = await Invoice.create({
                  invoiceNumber,
                  classId: request.classId,
                  studentId: request.studentId,
                  feeId: feeRecord._id,
                  feeMonth: normalizedFeeMonth,
                  feeYear: normalizedFeeYear,
                  totalFee: normalizedTotalFee,
                  amountPaid: normalizedAmountPaid ?? 0,
                  sentToEmail: studentEmail,
                });
              } catch (error) {
                if (error?.code === 11000) {
                  invoiceNumber = generateInvoiceNumber(new Date());
                  invoiceRecord = await Invoice.create({
                    invoiceNumber,
                    classId: request.classId,
                    studentId: request.studentId,
                    feeId: feeRecord._id,
                    feeMonth: normalizedFeeMonth,
                    feeYear: normalizedFeeYear,
                    totalFee: normalizedTotalFee,
                    amountPaid: normalizedAmountPaid ?? 0,
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
                  feeMonth: normalizedFeeMonth,
                  feeYear: normalizedFeeYear,
                  totalFee: normalizedTotalFee,
                  amountPaid: normalizedAmountPaid ?? 0,
                  currency: process.env.INVOICE_CURRENCY || "INR",
                });

                const feeMonthLabel = formatFeePeriodLabel(normalizedFeeMonth, normalizedFeeYear);
                const subject = `Invoice ${invoiceRecord.invoiceNumber} for ${classExists.classTitle}`;
                const text = `Hi ${studentExists.name},\n\nThank you for your payment. Please find your invoice (${invoiceRecord.invoiceNumber}) attached.\n\nCourse: ${classExists.classTitle}\nFee Month: ${feeMonthLabel}\nTotal Fee: ${normalizedTotalFee}\nAmount Paid: ${normalizedAmountPaid}\n\nRegards,\nMentor Language Institute`;
                const html = `
              <div style="font-family:Arial, sans-serif; line-height:1.6; color:#111;">
                <p>Hi ${studentExists.name},</p>
                <p>Thank you for your payment. Please find your invoice attached.</p>
                <p><strong>Invoice:</strong> ${invoiceRecord.invoiceNumber}</p>
                <p><strong>Course:</strong> ${classExists.classTitle}<br/>
                <strong>Fee Month:</strong> ${feeMonthLabel}<br/>
                <strong>Total Fee:</strong> ${normalizedTotalFee}<br/>
                <strong>Amount Paid:</strong> ${normalizedAmountPaid}</p>
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

      request.status = "approved";
      request.adminId = req.user.userId;
      request.decisionAt = new Date();
      if (request.requestType === "fee_payment") {
        request.feeYear = normalizedFeeYear;
      }
      await request.save();

      try {
        const feeMonthLabel = formatFeePeriodLabel(normalizedFeeMonth, normalizedFeeYear);
        const balanceDue = Math.max(
          0,
          Number(normalizedTotalFee) - Number(normalizedAmountPaid ?? 0)
        );
        const approvalMessage = treatAsFeePayment
          ? paymentStatus === "paid"
            ? `Your payment for ${classExists.classTitle} (${feeMonthLabel}) has been recorded.`
            : paymentStatus === "partial"
              ? `Partial payment recorded for ${classExists.classTitle} (${feeMonthLabel}). Balance due: ${balanceDue}.`
              : `Payment recorded for ${classExists.classTitle} (${feeMonthLabel}). Pending balance remains.`
          : paymentStatus === "paid"
            ? `Your enrollment request has been approved. Fee month: ${feeMonthLabel}. Invoice sent to your email.`
            : paymentStatus === "partial"
              ? `Your enrollment request has been approved. Fee month: ${feeMonthLabel}. Partial payment recorded. Balance due: ${balanceDue}.`
              : `Your enrollment request has been approved. Fee month: ${feeMonthLabel}. Payment pending.`;
        await createNotification({
          userId: studentExists._id,
          role: "student",
          type:
            paymentStatus === "paid"
              ? "PAYMENT_REQUEST_APPROVED"
              : paymentStatus === "partial"
                ? "PAYMENT_PARTIAL"
                : "PAYMENT_REQUEST_APPROVED",
          title: treatAsFeePayment
            ? `Payment updated for ${classExists.classTitle}`
            : `Enrollment approved for ${classExists.classTitle}`,
          message: approvalMessage,
          classId: classExists._id,
          feeMonth: normalizedFeeMonth,
          feeYear: normalizedFeeYear,
          payload: {
            classTitle: classExists.classTitle,
            feeMonth: normalizedFeeMonth,
            feeYear: normalizedFeeYear,
            totalFee: normalizedTotalFee,
            amountPaid: normalizedAmountPaid ?? 0,
            balanceDue,
            paymentStatus,
            paid: effectivePaid,
          },
        });
      } catch (notifyError) {
        console.error("Failed to notify request approval:", notifyError);
      }

      return res.status(200).json({
        message: treatAsFeePayment
          ? paymentStatus === "paid"
            ? "Payment recorded and invoice sent."
            : paymentStatus === "partial"
              ? "Partial payment recorded."
              : "Payment recorded with pending balance."
          : paymentStatus === "paid"
            ? "Payment request approved. Student enrolled and invoice sent."
            : paymentStatus === "partial"
              ? "Payment request approved. Student enrolled and partial payment recorded."
              : "Payment request approved. Student enrolled with pending payment.",
      });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json({ message: "Failed to approve payment request." });
    }
  }
);

router.put(
  "/payment-requests/:id/reject",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};

      const request = await PaymentRequest.findById(id);
      if (!request) {
        return res.status(404).json({ message: "Payment request not found." });
      }
      if (request.status !== "pending") {
        return res
          .status(409)
          .json({ message: "Payment request already processed." });
      }

      request.status = "rejected";
      request.adminId = req.user.userId;
      request.decisionAt = new Date();
      request.rejectionReason = reason ? String(reason).trim() : "";
      await request.save();

      await Students.findByIdAndUpdate(request.studentId, {
        $pull: { appliedClasses: request.classId },
      });
      await Classes.findByIdAndUpdate(request.classId, {
        $pull: { appliedStudents: request.studentId },
      });

      try {
        const classDoc = await Classes.findById(request.classId);
        const classTitle = classDoc?.classTitle || "your course";
        const reasonText = request.rejectionReason
          ? ` Reason: ${request.rejectionReason}`
          : "";
        await createNotification({
          userId: request.studentId,
          role: "student",
          type: "PAYMENT_REQUEST_REJECTED",
          title: `Enrollment request rejected`,
          message: `Your enrollment request for ${classTitle} was rejected.${reasonText}`,
          classId: request.classId,
          payload: {
            classTitle,
            reason: request.rejectionReason || "",
          },
        });
      } catch (notifyError) {
        console.error("Failed to notify request rejection:", notifyError);
      }

      return res.status(200).json({ message: "Payment request rejected." });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json({ message: "Failed to reject payment request." });
    }
  }
);

// UPDATE FEE DETAIL
router.put(
  "/update-fee/:id1/:id2",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id1, id2 } = req.params;
      const { feeMonth, feeMonths, feeYear, paid, amountPaid, totalFee: totalFeeInput } = req.body;
      const normalizedPaid = normalizePaidStatus(paid);
      if (normalizedPaid === null) {
        return res.status(400).json({
          message: "Invalid payment status. Use paid or pending.",
        });
      }

      const requestedMonths = normalizeFeeMonths(feeMonths ?? feeMonth);
      if (!requestedMonths.length) {
        return res.status(400).json({
          message: "Fee month must be a valid month number (1-12).",
        });
      }
      const providedYear = normalizeFeeYear(feeYear);
      if (feeYear !== undefined && feeYear !== null && feeYear !== "" && !providedYear) {
        return res.status(400).json({
          message: "Fee year must be a valid year (e.g., 2026).",
        });
      }
      const normalizedFeeYear = providedYear || new Date().getFullYear();

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

      const normalizedTotalFee =
        totalFeeInput !== undefined && totalFeeInput !== null && totalFeeInput !== ""
          ? parseFeeAmount(totalFeeInput)
          : null;
      if (normalizedTotalFee !== null && normalizedTotalFee < 0) {
        return res.status(400).json({
          message: "Total fee must be a valid number.",
        });
      }

      const student = await Students.findById(id2);
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
      const hasPayment = normalizedAmountPaid > 0;
      if (hasPayment && !student.email) {
        return res.status(400).json({
          message: "Student email is required to send the invoice.",
        });
      }

      const classExists = await Classes.findById(id1);
      if (!classExists) {
        return res.status(404).json({ message: "Class not found." });
      }

      let fee = await Fee.findOne({ classId: id1, studentId: id2 });
      if (!fee) {
        if (normalizedTotalFee === null) {
          return res.status(400).json({
            message: "Total fee is required before recording payments.",
          });
        }
        fee = new Fee({
          classId: id1,
          studentId: id2,
          totalFee: normalizedTotalFee,
          detailFee: [],
        });
      }

      const effectiveTotalFee =
        normalizedTotalFee !== null ? normalizedTotalFee : fee.totalFee;
      if (
        effectiveTotalFee === null ||
        effectiveTotalFee === undefined ||
        !Number.isFinite(Number(effectiveTotalFee))
      ) {
        return res.status(400).json({
          message: "Total fee is required before recording payments.",
        });
      }
      if (normalizedPaid && Number(effectiveTotalFee) <= 0) {
        return res.status(400).json({
          message: "Total fee must be greater than zero to mark as paid.",
        });
      }
      if (
        Number.isFinite(Number(effectiveTotalFee)) &&
        Number(effectiveTotalFee) > 0 &&
        normalizedAmountPaid > effectiveTotalFee
      ) {
        return res.status(400).json({
          message: "Amount paid cannot exceed total fee.",
        });
      }

      const paymentState = computePaymentState(
        effectiveTotalFee,
        normalizedAmountPaid
      );
      const effectivePaid = paymentState.isPaid;
      const paymentStatus = paymentState.status;

      const currentYear = new Date().getFullYear();
      const resolveDetailYear = (detail) => {
        const yearValue = normalizeFeeYear(detail?.feeYear);
        if (yearValue) return yearValue;
        return normalizedFeeYear === currentYear ? currentYear : null;
      };
      const wasPaidByMonth = new Map();
      requestedMonths.forEach((monthValue) => {
        const existingDetail = fee.detailFee.find(
          (detail) =>
            normalizeFeeMonth(detail.feeMonth) === monthValue &&
            resolveDetailYear(detail) === normalizedFeeYear
        );
        wasPaidByMonth.set(monthValue, existingDetail?.paid === true);

        if (existingDetail) {
          existingDetail.paid = effectivePaid;
          existingDetail.amountPaid = normalizedAmountPaid ?? 0;
          existingDetail.feeYear = normalizedFeeYear;
        } else {
          fee.detailFee.push({
            feeMonth: monthValue,
            feeYear: normalizedFeeYear,
            paid: effectivePaid,
            amountPaid: normalizedAmountPaid ?? 0,
          });
        }
      });

      if (normalizedTotalFee !== null) {
        fee.totalFee = normalizedTotalFee;
      }
      await fee.save();

      if (hasPayment) {
        const studentEmail = student.email;
        for (const monthValue of requestedMonths) {
          const issuedAt = new Date();
          let invoiceRecord = await Invoice.findOne({
            feeId: fee._id,
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
                feeId: fee._id,
                feeMonth: monthValue,
                feeYear: normalizedFeeYear,
                totalFee: effectiveTotalFee,
                amountPaid: normalizedAmountPaid ?? 0,
                sentToEmail: studentEmail,
              });
            } catch (error) {
              if (error?.code === 11000) {
                invoiceNumber = generateInvoiceNumber(new Date());
                invoiceRecord = await Invoice.create({
                  invoiceNumber,
                  classId: id1,
                  studentId: id2,
                  feeId: fee._id,
                  feeMonth: monthValue,
                  feeYear: normalizedFeeYear,
                  totalFee: effectiveTotalFee,
                  amountPaid: normalizedAmountPaid ?? 0,
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
                  invoiceNumber,
                  issuedAt,
                  studentName: student.name,
                  studentEmail,
                  classTitle: classExists.classTitle,
                  feeMonth: monthValue,
                  feeYear: normalizedFeeYear,
                  totalFee: effectiveTotalFee,
                  amountPaid: normalizedAmountPaid ?? 0,
                  currency: process.env.INVOICE_CURRENCY || "INR",
                });

              const feeMonthLabel = formatFeePeriodLabel(monthValue, normalizedFeeYear);
              const subject = `Invoice ${invoiceNumber} for ${classExists.classTitle}`;
              const text = `Hi ${student.name},\n\nThank you for your payment. Please find your invoice (${invoiceNumber}) attached.\n\nCourse: ${classExists.classTitle}\nFee Month: ${feeMonthLabel}\nTotal Fee: ${effectiveTotalFee}\nAmount Paid: ${normalizedAmountPaid}\n\nRegards,\nMentor Language Institute`;
              const html = `
              <div style="font-family:Arial, sans-serif; line-height:1.6; color:#111;">
                <p>Hi ${student.name},</p>
                <p>Thank you for your payment. Please find your invoice attached.</p>
                <p><strong>Invoice:</strong> ${invoiceNumber}</p>
                <p><strong>Course:</strong> ${classExists.classTitle}<br/>
                <strong>Fee Month:</strong> ${feeMonthLabel}<br/>
                <strong>Total Fee:</strong> ${effectiveTotalFee}<br/>
                <strong>Amount Paid:</strong> ${normalizedAmountPaid}</p>
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
                    filename: `Invoice-${invoiceNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                  },
                ],
              });

              await Invoice.findByIdAndUpdate(invoiceRecord._id, {
                emailStatus: "sent",
                sentToEmail: studentEmail,
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

      try {
        const balanceDue = Math.max(
          0,
          Number(effectiveTotalFee) - Number(normalizedAmountPaid ?? 0)
        );
        const title =
          paymentStatus === "paid"
            ? `Payment received for ${classExists.classTitle}`
            : paymentStatus === "partial"
              ? `Partial payment received for ${classExists.classTitle}`
              : `Payment updated for ${classExists.classTitle}`;
        for (const monthValue of requestedMonths) {
          const feeMonthLabel = formatFeePeriodLabel(monthValue, normalizedFeeYear);
          const message =
            paymentStatus === "paid"
              ? `We received your payment for ${classExists.classTitle} (${feeMonthLabel}).`
              : paymentStatus === "partial"
                ? `We received a partial payment of ${normalizedAmountPaid}. Remaining balance: ${balanceDue}. (${feeMonthLabel}).`
                : `Your payment status was updated for ${classExists.classTitle} (${feeMonthLabel}).`;
          await createNotification({
            userId: student._id,
            role: "student",
            type:
              paymentStatus === "paid"
                ? "PAYMENT_RECEIVED"
                : paymentStatus === "partial"
                  ? "PAYMENT_PARTIAL"
                  : "PAYMENT_STATUS_UPDATED",
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
              amountPaid: normalizedAmountPaid ?? 0,
              balanceDue,
              paymentStatus,
            },
          });
        }
      } catch (notifyError) {
        console.error("Failed to notify payment update:", notifyError);
      }

      res.status(200).json({
        message: `Fee updated successfully.`,
        fee,
        updatedMonths: requestedMonths,
        feeYear: normalizedFeeYear,
      });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error);
    }
  }
);

// GET ATTENDANCE DETAIL OF A STUDENT OF A CLASS
router.get(
  "/attendance/:id1/:id2",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id1, id2 } = req.params;

      const attendanceById = await Attendance.findOne({
        classId: id1,
        studentId: id2,
      });

      res.status(200).json(attendanceById);
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error);
    }
  }
);

// GET FEE DETAIL OF A STUDENT OF A CLASS
router.get("/fee/:id1/:id2", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id1, id2 } = req.params;

    const feeById = await Fee.findOne({ classId: id1, studentId: id2 });
    if (!feeById) {
      return res.status(403).json({ message: "No record found!!!" });
    }

    res.status(200).json(feeById);
  } catch (error) {
    console.log("Something went wrong!!!", error);
    res.status(500).json(error);
  }
});

// GET ATTENDANCE AND COMMISSION INFO
router.get("/attendance/:id", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceDate, teacherId } = req.query; // Change req.body to req.query

    const attendances = await Attendance.find({
      classId: id,
      "detailAttendance.classDate": attendanceDate,
    });

    if (attendances.length === 0) {
      // Check if the length is zero
      return res.status(403).json({ message: "No record found!!!" });
    }

    const filtered = attendances.map((doc) => {
      const detailAttendance = (doc.detailAttendance || []).filter((entry) => {
        const dateMatch = entry.classDate === attendanceDate;
        const teacherMatch = teacherId
          ? String(entry.teacherId) === String(teacherId)
          : true;
        return dateMatch && teacherMatch;
      });
      return {
        ...doc.toObject(),
        detailAttendance,
      };
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.log("Something went wrong!!! ", error); // Log the error for debugging
    res.status(500).json({ error: "Something went wrong!!!" }); // Return a generic error message
  }
});

// UPDATE TEACHER PER DAY COMMISSION OF EACH STUDENT
router.post(
  "/update-commission/:id1/:id2",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { commission, classDate, teacherId } = req.body;
      const { id1, id2 } = req.params;

      const updateCommission = await Attendance.findOneAndUpdate(
        {
          classId: id1,
          studentId: id2,
          "detailAttendance.classDate": classDate,
          ...(teacherId ? { "detailAttendance.teacherId": teacherId } : {}),
        },

        {
          $set: {
            "detailAttendance.$.commission": commission,
          },
        },
        { new: true }
      );

      if (!updateCommission) {
        return res.status(404).json({ message: "Record not found." });
      }

      res.status(200).json(updateCommission);
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

// GET TEACHER'S MONTHLY COMMISSION
router.get(
  "/monthly-commission/:id1/:id2",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id1, id2 } = req.params;
      const { classDoc, commissions } = await calculateMonthlyCommission(id2, id1);

      if (!classDoc) {
        return res.status(404).json({ message: "Class not found." });
      }

      res.status(200).json(sortCommissions(commissions));
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

router.get(
  "/pending-commissions",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { teacherId, classId, refresh } = req.query;
      const query = { paid: { $nin: [true, "true"] } };
      if (teacherId) query.teacherId = teacherId;
      if (classId) query.classId = classId;

      if (String(refresh || "").toLowerCase() === "true") {
        const assignmentQuery = { active: true };
        if (teacherId) assignmentQuery.teacherId = teacherId;
        if (classId) assignmentQuery.classId = classId;

        const assignments = await ClassTeachers.find(assignmentQuery).select(
          "classId teacherId"
        );
        for (const assignment of assignments) {
          await calculateMonthlyCommission(assignment.classId, assignment.teacherId);
        }
      }

      const commissions = await Commission.find(query)
        .populate({ path: "teacherId", select: "name phone" })
        .populate({ path: "classId", select: "classTitle" });

      const monthOrder = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthIndex = (name) => monthOrder.indexOf(name);

      const sorted = [...commissions].sort((a, b) => {
        const yearDiff = Number(a.year) - Number(b.year);
        if (yearDiff !== 0) return yearDiff;
        return monthIndex(a.monthName) - monthIndex(b.monthName);
      });

      res.status(200).json(sorted);
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json({ message: "Failed to fetch pending commissions." });
    }
  }
);

router.delete(
  "/delete-all-commissions",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const confirm = String(req.query.confirm || "").toLowerCase();
      if (confirm !== "true") {
        return res.status(400).json({
          message: "Confirmation required. Use confirm=true to proceed.",
        });
      }

      const result = await Commission.deleteMany({});
      return res.status(200).json({
        message: `Deleted ${result.deletedCount || 0} commissions.`,
        deletedCount: result.deletedCount || 0,
      });
    } catch (error) {
      console.log("Something went wrong!!!", error);
      res.status(500).json({ message: "Failed to delete all commissions." });
    }
  }
);

// ADD MONTHLY COMMISSION (admin only)
router.post("/add-monthly-commission", AdminAuthenticateToken, async (req, res) => {
  try {
    const { teacherId, classId, monthName, year, classesTaken } = req.body;

    if (!teacherId || !classId || !monthName || !year) {
      return res.status(400).json({ message: "teacherId, classId, monthName, and year are required." });
    }

    const existing = await Commission.findOne({
      teacherId,
      classId,
      monthName,
      year,
    });

    if (existing) {
      return res.status(409).json({ message: "Monthly commission already exists for this teacher/class/month/year." });
    }

    const newCommission = new Commission({
      teacherId,
      classId,
      monthName,
      year,
      classesTaken,
    });

    await newCommission.save();

    res.status(201).json({
      message: "Monthly commission created successfully.",
      commission: newCommission,
    });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET PENDING PAYMENTS
  router.get(
    "/pending-payments",
    AdminAuthenticateToken,
    async (req, res) => {
      try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const { month, year, classId } = req.query || {};
        const requestedMonth = month !== undefined && month !== null && String(month).trim() !== ""
          ? normalizeFeeMonth(month)
          : null;
        if (month !== undefined && month !== null && String(month).trim() !== "" && !requestedMonth) {
          return res.status(400).json({ success: false, message: "Invalid month filter." });
        }
        const requestedYear = year !== undefined && year !== null && String(year).trim() !== ""
          ? normalizeFeeYear(year)
          : null;
        if (year !== undefined && year !== null && String(year).trim() !== "" && !requestedYear) {
          return res.status(400).json({ success: false, message: "Invalid year filter." });
        }

        if (classId && !mongoose.isValidObjectId(classId)) {
          return res.status(400).json({ success: false, message: "Invalid class filter." });
        }

        const targetMonth = requestedMonth || currentMonth;
        const targetYear = requestedYear || now.getFullYear();
        const feeQuery = {};
        if (classId) {
          feeQuery.classId = classId;
        }

        const fees = await Fee.find(feeQuery)
          .populate({ path: "studentId", select: "name email phone" })
          .populate({ path: "classId", select: "classTitle" })
          .lean();

      const pendingPayments = [];

      const pushPending = (feeDoc, detail, monthValue, yearValue) => {
        if (!feeDoc?.studentId?.name || !feeDoc?.classId?.classTitle) {
          return;
        }
        const totalFee = Number(feeDoc?.totalFee ?? 0);
        if (!Number.isFinite(totalFee) || totalFee <= 0) {
          return;
        }
        const normalizedMonth = normalizeFeeMonth(monthValue);
        if (!normalizedMonth) {
          return;
        }
        if (normalizedMonth !== targetMonth) {
          return;
        }
        if (yearValue !== targetYear) {
          return;
        }
        const amountPaid = Number(detail?.amountPaid ?? 0);
        if (Number.isFinite(amountPaid) && amountPaid >= totalFee) {
          return;
        }

        pendingPayments.push({
          feeId: feeDoc?._id,
          classId: feeDoc?.classId?._id || feeDoc?.classId,
          studentId: feeDoc?.studentId?._id || feeDoc?.studentId,
          totalFee,
          feeMonth: normalizedMonth,
          feeYear: targetYear,
          amountPaid: Number.isFinite(amountPaid) ? amountPaid : 0,
          paid: detail?.paid === true,
          studentName: feeDoc?.studentId?.name,
          studentEmail: feeDoc?.studentId?.email,
          studentPhone: feeDoc?.studentId?.phone,
          classTitle: feeDoc?.classId?.classTitle,
        });
      };

      for (const feeDoc of fees) {
        const detailFee = Array.isArray(feeDoc?.detailFee) ? feeDoc.detailFee : [];
        const currentDetail = detailFee.find((detail) => {
          const detailMonth = normalizeFeeMonth(detail?.feeMonth);
          if (detailMonth !== targetMonth) return false;
          const detailYear = normalizeFeeYear(detail?.feeYear);
          if (detailYear) return detailYear === targetYear;
          return targetYear === now.getFullYear();
        });
        if (currentDetail) {
          const detailYear = normalizeFeeYear(currentDetail?.feeYear) || (targetYear === now.getFullYear() ? targetYear : null);
          if (detailYear) {
            pushPending(feeDoc, currentDetail, targetMonth, detailYear);
          }
        } else {
          pushPending(feeDoc, { amountPaid: 0, paid: false }, targetMonth, targetYear);
        }
      }

      pendingPayments.sort((a, b) => {
        const nameA = (a.studentName || "").toLowerCase();
        const nameB = (b.studentName || "").toLowerCase();
        if (nameA !== nameB) return nameA.localeCompare(nameB);
        const classA = (a.classTitle || "").toLowerCase();
        const classB = (b.classTitle || "").toLowerCase();
        if (classA !== classB) return classA.localeCompare(classB);
        if (Number(a.feeYear || 0) !== Number(b.feeYear || 0)) {
          return Number(a.feeYear || 0) - Number(b.feeYear || 0);
        }
        return Number(a.feeMonth || 0) - Number(b.feeMonth || 0);
      });

      res.status(200).json({
        success: true,
        pendingPayments,
      });
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// EDIT MONTHLY COMMISSION (admin only)
router.put(
  "/edit-monthly-commission/:commissionId",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { commissionId } = req.params;
      const { monthName, year, classesTaken } = req.body;

      const commission = await Commission.findById(commissionId);

      if (!commission) {
        return res.status(404).json({ message: "Commission record not found" });
      }

      if (commission.paid === true) {
        return res
          .status(403)
          .json({ message: "Cannot edit. Commission already marked as paid." });
      }

      const updatedCommission = await Commission.findByIdAndUpdate(
        commissionId,
        { monthName, year, classesTaken },
        { new: true }
      );

      res.status(200).json({
        message: "Monthly commission updated successfully!",
        commission: updatedCommission,
      });
    } catch (error) {
      console.error("Error updating monthly commission:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// DELETE MONTHLY COMMISSION (admin only)
router.delete(
  "/delete-monthly-commission/:commissionId",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { commissionId } = req.params;

      const commission = await Commission.findById(commissionId);

      if (!commission) {
        return res.status(404).json({ message: "Commission record not found" });
      }

      if (commission.paid === true) {
        return res
          .status(403)
          .json({
            message: "Cannot delete. Commission already marked as paid.",
          });
      }

      await Commission.findByIdAndDelete(commissionId);

      res.status(200).json({
        message: "Monthly commission deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting monthly commission:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// UPDATE TEACHER'S MONTHLY COMMISSION
router.post(
  "/update-monthly-commission/:id",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { paid, remarks } = req.body;

      const updateMonthlyCommission = await Commission.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            paid: paid,
            remarks: remarks,
          },
        },
        { new: true }
      );

      if (!updateMonthlyCommission) {
        return res.status(403).json({ message: "Record not found!!!" });
      }

      res
        .status(200)
        .json({
          message: "Monthly commission updated successfully",
          commission: updateMonthlyCommission,
        });
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

// DEACTIVATE STUDENT ID
router.put(
  "/deactivate-account/:id",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await Students.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          $set: { deactivated: status },
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

// DELETE COURSE
router.delete(
  "/delete-course/:id",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const findCourse = await Classes.findById({ _id: id });
      if (!findCourse) {
        return res.status(402).json({ message: "No course found!!!" });
      }

      // Remove the class ID from students' classes
      await Students.updateMany(
        { classes: id },
        { $pull: { classes: id } }
      );
      await Students.updateMany(
        { appliedClasses: id },
        { $pull: { appliedClasses: id } }
      );

      // Remove teacher assignments for this class
      await ClassTeachers.deleteMany({ classId: id });

      const attendanceIds = await Attendance.find({ classId: id }).distinct("_id");
      const feeIds = await Fee.find({ classId: id }).distinct("_id");

      await Attendance.deleteMany({ classId: id });
      await Fee.deleteMany({ classId: id });
      await Invoice.deleteMany({ classId: id });
      await ClassAccessStatus.deleteMany({ classId: id });
      await Commission.deleteMany({ classId: id });

      if (attendanceIds.length > 0) {
        await Students.updateMany(
          { attendanceDetail: { $in: attendanceIds } },
          { $pull: { attendanceDetail: { $in: attendanceIds } } }
        );
      }
      if (feeIds.length > 0) {
        await Students.updateMany(
          { feeDetail: { $in: feeIds } },
          { $pull: { feeDetail: { $in: feeIds } } }
        );
      }

      // Delete the class
      await Classes.findByIdAndDelete(id);

      res.status(200).json({ message: "Course deleted successfully!" });
    } catch (error) {
      console.log("Something went wrong!!!", error);
      res.status(500).json(error.message);
    }
  }
);

// DELETE TEACHER
router.delete(
  "/delete-teacher/:id",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const findTeacher = await Teachers.findByIdAndDelete({ _id: id });
      if (!findTeacher) {
        return res.status(402).json({ message: "No teacher found!!!" });
      }
      await ClassTeachers.deleteMany({ teacherId: id });

      res.status(200).json({ message: "Teacher deleted successfully!!!" });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error.message);
    }
  }
);

router.get(
  "/get-studentsListBySub/:id",
  AdminAuthenticateToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      // Fetch the class and populate the enrolledStudents field with user details
      const classDetails = await Classes.findById(id).populate({
        path: "enrolledStudents",
        select: "name phone dob", // Specify fields to include (e.g., 'name', 'email')
      });

      if (!classDetails) {
        return res.status(404).json({ message: "Class not found" });
      }
      // console.log("classDetails", classDetails.enrolledStudents);

      // Send the populated list of enrolled students
      res.status(200).json({
        success: true,
        enrolledStudents: classDetails.enrolledStudents,
      });
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

router.delete(
  "/delete-student/:id",
  AdminAuthenticateToken,
  async (req, res) => {
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

router.delete(
  "/delete-all-students",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const confirm = String(req.query.confirm || "").toLowerCase();
      if (confirm !== "true") {
        return res.status(400).json({
          message: "Confirmation required. Use confirm=true to proceed.",
        });
      }

      const result = await deleteAllStudentsCascade();
      return res.status(200).json({
        message: `Deleted ${result.deletedCount} students.`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.log("Something went wrong!!!", error);
      res.status(500).json({ message: "Failed to delete all students." });
    }
  }
);

router.delete(
  "/delete-all-courses",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const confirm = String(req.query.confirm || "").toLowerCase();
      if (confirm !== "true") {
        return res.status(400).json({
          message: "Confirmation required. Use confirm=true to proceed.",
        });
      }

      const result = await deleteAllCoursesCascade();
      return res.status(200).json({
        message: `Deleted ${result.deletedCount} courses.`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.log("Something went wrong!!!", error);
      res.status(500).json({ message: "Failed to delete all courses." });
    }
  }
);

router.get(
  "/download-attendance-report",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { month, year, courseId } = req.query;
      if (!month || !year) {
        return res.status(400).send("Please provide both month and year.");
      }
      const monthNumber = Number(month);
      const yearNumber = Number(year);
      if (
        !Number.isInteger(monthNumber) ||
        monthNumber < 1 ||
        monthNumber > 12 ||
        !Number.isInteger(yearNumber)
      ) {
        return res.status(400).send("Month and year must be valid numbers.");
      }

      let allClasses = [];

      if (courseId) {
        // Fetch a specific class by ID and branch
        const course = await Classes.findById(courseId).populate({
          path: "enrolledStudents",
          populate: {
            path: "attendanceDetail",
            model: "Attendance",
          },
        });

        if (!course) {
          return res.status(404).send("Course not found.");
        }

        allClasses.push(course); // Wrap in array for uniform processing
      } else {
        // Fetch all classes in branch
        allClasses = await Classes.find({}).populate({
          path: "enrolledStudents",
          populate: {
            path: "attendanceDetail",
            model: "Attendance",
          },
        });
      }

      // Excel generation logic
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Attendance Report");

      const monthName = new Date(yearNumber, monthNumber - 1, 1).toLocaleString(
        "default",
        { month: "long" }
      );

      const daysInMonth = new Date(yearNumber, monthNumber, 0).getDate();
      const dayLabels = Array.from({ length: daysInMonth }, (_, index) =>
        String(index + 1).padStart(2, "0")
      );
      const totalColumns = 2 + dayLabels.length + 2; // Sno + Name + days + Total + Grade

      sheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = sheet.getCell(1, 1);
      titleCell.value = `Attendance Report - ${monthName} ${year}`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center" };

      let currentRow = 3;

      for (const course of allClasses) {
        const courseTitle = course.classTitle || "Unnamed Course";

        sheet.mergeCells(currentRow, 1, currentRow, totalColumns);
        sheet.getCell(currentRow, 1).value = courseTitle;
        sheet.getCell(currentRow, 1).font = {
          bold: true,
          color: { argb: "FF000000" },
        };
        sheet.getCell(currentRow, 1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFBE2C3" },
        };
        currentRow++;

        // Table headers
        sheet.getRow(currentRow).values = [
          "Sno.",
          "Name",
          ...dayLabels,
          "Total Hours",
          "Grade",
        ];
        sheet.getRow(currentRow).font = { bold: true };
        sheet.getRow(currentRow).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2B632" },
        };
        currentRow++;

        let sno = 1;

        for (const student of course.enrolledStudents) {
          let total = 0;
          let grade = student?.grade || "";
          const dayTotals = {};

          for (const attendance of student.attendanceDetail || []) {
            if (String(attendance.classId) !== String(course._id)) continue;

            for (const detail of attendance.detailAttendance || []) {
              const parsed = parseClassDateParts(detail?.classDate);
              if (!parsed) continue;
              if (parsed.month !== monthNumber || parsed.year !== yearNumber) {
                continue;
              }
              if (parsed.day < 1 || parsed.day > daysInMonth) continue;

              const value = Number(detail?.numberOfClassesTaken || 0);
              if (!Number.isFinite(value)) continue;

              const next = (dayTotals[parsed.day] || 0) + value;
              dayTotals[parsed.day] = next;
              total += value;
            }
          }

          const row = sheet.getRow(currentRow);
          row.values = [
            sno++,
            student.name,
            ...dayLabels.map((label) => {
              const day = Number(label);
              const value = dayTotals[day] || 0;
              return Number.isFinite(value) ? Number(value.toFixed(1)) : 0;
            }),
            Number(total.toFixed(1)),
            grade,
          ];

          if (total === 0) {
            row.getCell(2).font = { color: { argb: "FFFF0000" }, bold: true };
          }

          currentRow++;
        }

        currentRow++;
      }

      sheet.columns = [
        { key: "sno", width: 8 },
        { key: "name", width: 30 },
        ...dayLabels.map((label) => ({ key: `day_${label}`, width: 6 })),
        { key: "total", width: 12 },
        { key: "grade", width: 16 },
      ];

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Attendance_${month}_${year}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error("Excel generation error:", err);
      res.status(500).send("Failed to generate Excel report.");
    }
  }
);

export default router;
