import express from "express";
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
import { calculateMonthlyCommission, parseClassDate, sortCommissions } from "../utils/commission.js";
import { deriveGradeFromText, isGradeMatch, resolveCourseGrade, toGradeLabel } from "../utils/grade.js";
import { normalizeCommissionRateValue } from "../utils/classTeachers.js";
import { generateInvoiceNumber, generateInvoicePdfBuffer } from "../services/invoiceService.js";
import { sendEmail } from "../services/emailService.js";
import { createRefreshTokenRecord, setRefreshCookie, signAccessToken } from "../utils/authTokens.js";
import { deleteAllCoursesCascade } from "../utils/deleteCourseCascade.js";
import { deleteAllStudentsCascade, deleteStudentCascade } from "../utils/deleteStudentCascade.js";
import {
  normalizeFeeMonth,
  normalizePaidStatus,
  parseFeeAmount,
  formatFeeMonthLabel,
} from "../utils/fee.js";
import {
  findStudentUniquenessConflict,
  isValidEmail,
  normalizeEmail,
} from "../utils/studentValidation.js";
import ExcelJS from "exceljs";
dotenv.config();

const router = express.Router();

const normalizeRateInput = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return normalizeCommissionRateValue(value);
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
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "Name, phone number, and password are required.",
      });
    }

    const adminuser = await Admin.findOne({ phone });
    if (adminuser) {
      return res.status(409).json({ message: "Admin user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      role: "admin",
      name,
      username: name + "-" + phone,
      phone,
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
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }
    const user = await Admin.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username" });
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
      phone: user.phone,
      role: user.role || "admin",
    };
    const token = signAccessToken(accessPayload, "admin");
    const refreshToken = await createRefreshTokenRecord({
      userId: user._id,
      role: "admin",
    });
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
    const normalizedPhone = phone ? phone.trim() : null;
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
  const { name, phone, password, dob, courseId } = req.body;

  try {
    // Validate input fields (optional, depending on your requirements)

    // Find the student by ID
    const teacher = await Teachers.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "teacher not found." });
    }

    // Check if username already exists (excluding the current student)
    if (phone) {
      const existingTeacher = await Teachers.findOne({ phone });
      if (existingTeacher && existingTeacher._id.toString() !== id) {
        return res.status(400).json({
          message: "Teacher already taken. Please enter a unique phone number",
        });
      }
    }


    if (name) {
      teacher.name = name;
    }
    if (phone) {
      teacher.phone = phone;
    }
    if (dob) {
      teacher.dob = dob;
    }


    if (courseId) {
      const course = await Classes.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }
      const existingAssignment = await ClassTeachers.findOne({
        classId: courseId,
        teacherId: teacher._id,
      });
      if (!existingAssignment) {
        const assignment = new ClassTeachers({
          classId: courseId,
          teacherId: teacher._id,
          commissionRate: 0,
          offlineCommissionRate: 0,
          onlineCommissionRate: 0,
        });
        await assignment.save();
      } else if (!existingAssignment.active) {
        existingAssignment.active = true;
        await existingAssignment.save();
      }
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
      courseId,
      commissionRate,
      offlineCommissionRate,
      onlineCommissionRate,
    } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "Name, phone number, and password are required.",
      });
    }

    const teacher = await Teachers.exists({ phone });

    if (teacher) {
      return res
        .status(409)
        .json({ message: "Teacher has already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (courseId) {
      const course = await Classes.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }
    }

    const newTeacher = new Teachers({
      branch: "Main",
      role: "teacher",
      name,
      phone,
      dob,
      password: hashedPassword,
    });

    await newTeacher.save();

    if (courseId) {
      const rates = buildCommissionRates({
        commissionRate,
        offlineCommissionRate,
        onlineCommissionRate,
      });
      const assignment = new ClassTeachers({
        classId: courseId,
        teacherId: newTeacher._id,
        commissionRate: rates.resolvedLegacy,
        offlineCommissionRate: rates.resolvedOffline,
        onlineCommissionRate: rates.resolvedOnline,
      });
      await assignment.save();
    }
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
    const updatedPhone = phone || admin.phone;


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
    if (phone) admin.phone = phone;
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
    const normalizedPhone = phone.trim();
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
    const { totalFee, feeMonth, paid, amountPaid } = req.body;
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

    const normalizedAmountPaid = normalizedPaid
      ? parseFeeAmount(amountPaid)
      : 0;
    if (normalizedPaid && (normalizedAmountPaid === null || normalizedAmountPaid <= 0)) {
      return res.status(400).json({
        message: "Amount paid must be a valid number when payment is marked paid.",
      });
    }
    if (
      normalizedPaid &&
      normalizedAmountPaid !== null &&
      normalizedAmountPaid > normalizedTotalFee
    ) {
      return res.status(400).json({
        message: "Amount paid cannot exceed total fee.",
      });
    }

    const classExists = await Classes.findById(id1);
    if (!classExists) {
      return res.status(404).json({ message: "Class not found." });
    }

    const studentExists = await Students.findById(id2);
    if (!studentExists) {
      return res.status(404).json({ message: "Student not found." });
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

    if (normalizedPaid && !studentExists.email) {
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

      const existingDetail = feeRecord.detailFee.find(
        (detail) => normalizeFeeMonth(detail.feeMonth) === normalizedFeeMonth
      );
      const wasPaid = existingDetail?.paid === true;

      if (existingDetail) {
        existingDetail.paid = normalizedPaid;
        existingDetail.amountPaid = normalizedAmountPaid ?? 0;
      } else {
        feeRecord.detailFee.push({
          feeMonth: normalizedFeeMonth,
          paid: normalizedPaid,
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

      if (normalizedPaid) {
        const studentEmail = studentExists.email;
        const issuedAt = new Date();
        let invoiceRecord = await Invoice.findOne({
          feeId: feeRecord._id,
          feeMonth: normalizedFeeMonth,
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
                totalFee: normalizedTotalFee,
                amountPaid: normalizedAmountPaid ?? 0,
                currency: process.env.INVOICE_CURRENCY || "INR",
              });

              const feeMonthLabel = formatFeeMonthLabel(normalizedFeeMonth);
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

    return res.status(200).json({
      message: `${studentExists.name} enrolled in ${classExists.classTitle} successfully.`,
    });
  } catch (error) {
    console.log("Something went wrong!!! ", error);
    res.status(500).json(error);
  }
});

// UPDATE FEE DETAIL
router.put(
  "/update-fee/:id1/:id2",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id1, id2 } = req.params;
      const { feeMonth, paid, amountPaid, totalFee: totalFeeInput } = req.body;
      const normalizedPaid = normalizePaidStatus(paid);
      if (normalizedPaid === null) {
        return res.status(400).json({
          message: "Invalid payment status. Use paid or pending.",
        });
      }

      const normalizedFeeMonth = normalizeFeeMonth(feeMonth);
      if (!normalizedFeeMonth) {
        return res.status(400).json({
          message: "Fee month must be a valid month number (1-12).",
        });
      }

      const normalizedAmountPaid = normalizedPaid
        ? parseFeeAmount(amountPaid)
        : 0;
      if (normalizedPaid && (normalizedAmountPaid === null || normalizedAmountPaid <= 0)) {
        return res.status(400).json({
          message: "Amount paid must be a valid number when payment is marked paid.",
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
      if (normalizedPaid && !student.email) {
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
        normalizedPaid &&
        Number.isFinite(Number(effectiveTotalFee)) &&
        Number(effectiveTotalFee) > 0 &&
        normalizedAmountPaid > effectiveTotalFee
      ) {
        return res.status(400).json({
          message: "Amount paid cannot exceed total fee.",
        });
      }

      const existingDetail = fee.detailFee.find(
        (detail) => normalizeFeeMonth(detail.feeMonth) === normalizedFeeMonth
      );
      const wasPaid = existingDetail?.paid === true;

      if (existingDetail) {
        existingDetail.paid = normalizedPaid;
        existingDetail.amountPaid = normalizedAmountPaid ?? 0;
      } else {
        fee.detailFee.push({
          feeMonth: normalizedFeeMonth,
          paid: normalizedPaid,
          amountPaid: normalizedAmountPaid ?? 0,
        });
      }

      if (normalizedTotalFee !== null) {
        fee.totalFee = normalizedTotalFee;
      }
      await fee.save();

      if (normalizedPaid) {
        const studentEmail = student.email;
        const issuedAt = new Date();
        let invoiceRecord = await Invoice.findOne({
          feeId: fee._id,
          feeMonth: normalizedFeeMonth,
          studentId: id2,
        });

        if (invoiceRecord?.emailStatus === "sent" && wasPaid) {
          return res.status(200).json({
            message: `Fee for ${normalizedFeeMonth} is updated successfully.`,
            fee,
          });
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
              feeMonth: normalizedFeeMonth,
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
                feeMonth: normalizedFeeMonth,
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
              feeMonth: normalizedFeeMonth,
              totalFee: effectiveTotalFee,
              amountPaid: normalizedAmountPaid ?? 0,
              currency: process.env.INVOICE_CURRENCY || "INR",
            });

            const feeMonthLabel = formatFeeMonthLabel(normalizedFeeMonth);
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

      res.status(200).json({
        message: `Fee for ${normalizedFeeMonth} is updated successfully.`,
        fee,
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
      const pendingFees = await Fee.aggregate([
        { $unwind: "$detailFee" },
        { $match: { "detailFee.paid": { $ne: true } } },
        {
          $lookup: {
            from: "students",
            localField: "studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: "$student" },
        {
          $lookup: {
            from: "classes",
            localField: "classId",
            foreignField: "_id",
            as: "class",
          },
        },
        { $unwind: "$class" },
        {
          $project: {
            feeId: "$_id",
            classId: 1,
            studentId: 1,
            totalFee: 1,
            feeMonth: "$detailFee.feeMonth",
            amountPaid: "$detailFee.amountPaid",
            paid: "$detailFee.paid",
            studentName: "$student.name",
            studentEmail: "$student.email",
            studentPhone: "$student.phone",
            classTitle: "$class.classTitle",
          },
        },
        { $sort: { studentName: 1 } },
      ]);

      res.status(200).json({
        success: true,
        pendingPayments: pendingFees,
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

      sheet.mergeCells("A1", "C1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = `Attendance Report - ${monthName} ${year}`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: "center" };

      let currentRow = 3;

      for (const course of allClasses) {
        const courseTitle = course.classTitle || "Unnamed Course";

        sheet.mergeCells(`A${currentRow}:C${currentRow}`);
        sheet.getCell(`A${currentRow}`).value = courseTitle;
        sheet.getCell(`A${currentRow}`).font = {
          bold: true,
          color: { argb: "FF000000" },
        };
        sheet.getCell(`A${currentRow}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFBE2C3" },
        };
        currentRow++;

        // Table headers
        sheet.getRow(currentRow).values = [
          "Sno.",
          "Name",
          "No. of Hours",
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

          for (const attendance of student.attendanceDetail || []) {
            if (String(attendance.classId) !== String(course._id)) continue;

            for (const detail of attendance.detailAttendance || []) {
              const parsed = parseClassDate(detail?.classDate);
              if (!parsed) continue;
              if (parsed.month === monthNumber && parsed.year === yearNumber) {
                total += parseFloat(detail?.numberOfClassesTaken || 0);
              }
            }
          }

          const row = sheet.getRow(currentRow);
          row.values = [sno++, student.name, total.toFixed(1), grade];

          if (total === 0) {
            row.getCell(2).font = { color: { argb: "FFFF0000" }, bold: true };
          }

          currentRow++;
        }

        currentRow++;
      }

      sheet.columns = [
        { key: "sno", width: 10 },
        { key: "name", width: 30 },
        { key: "total", width: 20 },
        { key: "grade", width: 20 },
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
