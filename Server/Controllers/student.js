import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cron from "node-cron";
import Students from "../Models/Students.js";
import StudentAuthenticateToken from "../Middlewares/StudentAuthenticateToken.js";
import Classes from "../Models/Classes.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import Teachers from "../Models/Teachers.js";
import Attendance from "../Models/Attendance.js";
import Fee from "../Models/Fee.js";
import ClassTeachers from "../Models/ClassTeachers.js";
import { normalizeFeeMonth, normalizePaidStatus, parseFeeAmount } from "../utils/fee.js";
import { createRefreshTokenRecord, setRefreshCookie, signAccessToken } from "../utils/authTokens.js";
import {
  isGradeMatch,
  normalizeGradeValue,
  resolveCourseGrade,
  toGradeLabel,
} from "../utils/grade.js";
import {
  findStudentUniquenessConflict,
  isValidEmail,
  normalizeEmail,
} from "../utils/studentValidation.js";

dotenv.config();

const router = express.Router();


router.post("/signup", async (req, res) => {
  try {
    const { name, phone, password, userName, dob, email, grade } = req.body;

    if (!name || !phone || !password || !userName || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const gradeLabel = toGradeLabel(grade);
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Students({
      branch: "Main",
      name,
      phone: normalizedPhone,
      email: normalizedEmail,
      userName: normalizedUserName,
      dob,
      grade: gradeLabel,
      password: hashedPassword,
    });

    await newStudent.save();

    return res
      .status(200)
      .json({ message: `New student has been registered successfully!!!` });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Username, phone number, or email already exists.",
      });
    }
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const user = await Students.findOne({ userName });
    if (!user) {
      return res.status(401).json({ message: "Invalid username" });
    }

    if (user.deactivated) {
      return res
        .status(402)
        .json({ message: "Your account has been deactivated!!!" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).json({ message: "Invalid password" });
    }

    const accessPayload = {
      userId: user._id,
      name: user.name,
      phone: user.phone,
      userName: user.userName,
      role: user.role || "student",
    };
    const token = signAccessToken(accessPayload, "student");
    const refreshToken = await createRefreshTokenRecord({
      userId: user._id,
      role: "student",
    });
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({ token });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.get("/my-profile", StudentAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const student = await Students.findById(userId, { password: 0 });

    if (!student) {
      return res.status(404).json({ message: "Student not find" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.put("/update-profile", StudentAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, userName, dob } = req.body;

    const student = await Students.findById(userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const normalizedUserName = userName ? userName.trim() : null;

    const conflictMessage = await findStudentUniquenessConflict({
      userName: normalizedUserName,
      excludeId: userId,
    });
    if (conflictMessage) {
      return res.status(409).json({ message: conflictMessage });
    }

    if (name) student.name = name;
    if (userName) student.userName = normalizedUserName;
    if (dob) student.dob = dob;

    await student.save();

    const updated = await Students.findById(userId, { password: 0 });
    return res
      .status(200)
      .json({ message: "Profile updated successfully.", student: updated });
  } catch (error) {
    console.log("Something went wrong!!! ");
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }
    res.status(500).json(error);
  }
});

router.get("/all-courses", StudentAuthenticateToken, async (req, res) => {
  try {
    const student = await Students.findById(req.user.userId).select("grade");
    const studentGrade = normalizeGradeValue(student?.grade);
    console.log("=== STUDENT ALL-COURSES DEBUG ===");
    console.log("Student userId:", req.user.userId);
    const allCourses = await Classes.find({}).lean();
    const gradeBackfills = [];
    const normalizedCourses = allCourses.map((course) => {
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

    const filteredCourses = normalizedCourses.filter((course) => {
      const courseGrade = normalizeGradeValue(course?.grade);
      if (!courseGrade) return true;
      if (!studentGrade) return false;
      return courseGrade === studentGrade;
    });
    console.log("Courses found for student:", allCourses.length);
    console.log("Student grade:", JSON.stringify(student?.grade));
    console.log("Filtered courses for grade:", filteredCourses.length);
    console.log("================================");

    res.status(200).json(filteredCourses);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.get("/all-courses/:id", StudentAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Students.findById(req.user.userId).select("grade classes");
    const singleCourse = await Classes.findById(id);
    if (!singleCourse) {
      return res.status(404).json({ message: "Course not found." });
    }
    if (!singleCourse.grade) {
      const inferred = resolveCourseGrade(singleCourse);
      if (inferred) {
        singleCourse.grade = inferred;
        await singleCourse.save();
      }
    }
    if (!isGradeMatch(singleCourse?.grade, student?.grade)) {
      const isEnrolled = (student?.classes || []).some(
        (classId) => String(classId) === String(id)
      );
      if (!isEnrolled) {
        return res
          .status(404)
          .json({ message: "Course not found for this grade." });
      }
    }
    const teachers = await ClassTeachers.find({
      classId: singleCourse._id,
      active: true,
    }).populate({ path: "teacherId", select: "-password" });

    res.status(200).json({ ...singleCourse.toObject(), teachers });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.get("/teacher/:id", StudentAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const myTeacher = await Teachers.findById({ _id: id }, { password: 0 });

    if (!myTeacher) {
      return res.status(409).json({ message: "Teacher not found" });
    }

    res.status(200).json(myTeacher);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.post("/apply-course/:id", StudentAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const student = await Students.findById(userId).select("grade");
    const classExists = await Classes.findById(id);
    if (!classExists) {
      return res.status(404).json({ message: "Class not found." });
    }
    const resolvedCourseGrade = resolveCourseGrade(classExists);
    if (resolvedCourseGrade && !classExists.grade) {
      classExists.grade = resolvedCourseGrade;
      await classExists.save();
    }
    if (!isGradeMatch(resolvedCourseGrade, student?.grade)) {
      return res
        .status(403)
        .json({ message: "Student grade does not match this course." });
    }

    const userApplied = await Classes.findOne({
      _id: id,
      appliedStudents: userId,
    });
    if (userApplied) {
      return res
        .status(409)
        .json({ message: "Student has already applied in this course!!!" });
    }

    const userRegistered = await Classes.findOne({
      _id: id,
      enrolledStudents: userId,
    });
    if (userRegistered) {
      return res
        .status(408)
        .json({ message: "Student has already registered in this course!!!" });
    }

    const classUpdate = await Classes.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { appliedStudents: userId },
      },
      { new: true }
    );

    const studentUpdate = await Students.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: { appliedClasses: id },
      }
    );

    res
      .status(200)
      .json({ message: "Student has applied for a course successfully!!!" });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.post(
  "/enroll-course/:id",
  StudentAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.user;
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
      if (
        normalizedPaid &&
        (normalizedAmountPaid === null || normalizedAmountPaid <= 0)
      ) {
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

      const classExists = await Classes.findById(id);
      if (!classExists) {
        return res.status(404).json({ message: "Class not found." });
      }
      const student = await Students.findById(userId).select("grade");
      const resolvedCourseGrade = resolveCourseGrade(classExists);
      if (resolvedCourseGrade && !classExists.grade) {
        classExists.grade = resolvedCourseGrade;
        await classExists.save();
      }
      if (!isGradeMatch(resolvedCourseGrade, student?.grade)) {
        return res
          .status(403)
          .json({ message: "Student grade does not match this course." });
      }

      const userRegistered = await Classes.findOne({
        _id: id,
        enrolledStudents: userId,
      });
      if (userRegistered) {
        return res.status(408).json({
          message: "Student has already registered in this course!!!",
        });
      }

      const updateClass = await Classes.findByIdAndUpdate(
        { _id: id },
        {
          $addToSet: { enrolledStudents: userId },
        },
        { new: true }
      );

      if (updateClass) {
        await ClassAccessStatus.findOneAndUpdate(
          { classId: id, studentId: userId },
          { classAccessStatus: true },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        let feeRecord = await Fee.findOne({ classId: id, studentId: userId });
        if (!feeRecord) {
          feeRecord = new Fee({
            classId: id,
            studentId: userId,
            totalFee: normalizedTotalFee,
            detailFee: [],
          });
        }

        const existingDetail = feeRecord.detailFee.find(
          (detail) => normalizeFeeMonth(detail.feeMonth) === normalizedFeeMonth
        );

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
          { _id: userId },
          {
            $addToSet: { classes: id, feeDetail: feeRecord._id },
          },
          { new: true }
        );

        // Remove id from appliedClasses array of Student
        await Students.findByIdAndUpdate(
          { _id: userId },
          {
            $pull: { appliedClasses: id },
          }
        );

        // Remove userId from appliedStudents array of Class
        await Classes.findByIdAndUpdate(
          { _id: id },
          {
            $pull: { appliedStudents: userId },
          }
        );
      }

      res.status(200).json({
        message: "Student has been enrolled in the course successfully!!!",
      });
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

router.get("/my-attendance/:id", StudentAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const attendanceDetails = await Attendance.findOne({
      classId: id,
      studentId: userId,
    });
    if (!attendanceDetails) {
      return res.status(403).json({ message: "No records found!!!" });
    }

    res.status(200).json(attendanceDetails);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.get(
  "/my-fee-details/:id",
  StudentAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.user;

      const myFeeDetails = await Fee.findOne({
        classId: id,
        studentId: userId,
      });
      if (!myFeeDetails) {
        return res.status(403).json({ message: "No records found!!!" });
      }

      res.status(200).json(myFeeDetails);
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

export default router;
