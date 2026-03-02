import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cron from "node-cron";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Students from "../Models/Students.js";
import StudentAuthenticateToken from "../Middlewares/StudentAuthenticateToken.js";
import Classes from "../Models/Classes.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import Teachers from "../Models/Teachers.js";
import Attendance from "../Models/Attendance.js";
import Fee from "../Models/Fee.js";
import ClassTeachers from "../Models/ClassTeachers.js";
import PaymentRequest from "../Models/PaymentRequest.js";
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
  },
});

const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "mentor/payment-requests",
        resource_type: "image",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });


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
    const { identifier, email, phone, userName, password } = req.body;
    const rawIdentifier = identifier || email || phone || userName;
    if (!rawIdentifier || !password) {
      return res
        .status(400)
        .json({ message: "Email or phone and password are required." });
    }

    const normalizedEmail = normalizeEmail(rawIdentifier);
    let user = null;
    if (isValidEmail(normalizedEmail)) {
      user = await Students.findOne({ email: normalizedEmail });
    }
    if (!user) {
      user = await Students.findOne({ phone: rawIdentifier });
    }
    if (!user) {
      user = await Students.findOne({ userName: rawIdentifier });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid email or phone" });
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
    return res.status(403).json({
      message:
        "Enrollment requests are submitted through the payment request form. Payment details are optional.",
    });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.post(
  "/enroll-course/:id",
  StudentAuthenticateToken,
  async (req, res) => {
    return res.status(403).json({
      message:
        "Enrollment requires admin approval. Please submit a payment request instead.",
    });
  }
);

router.post(
  "/payment-requests/:id",
  StudentAuthenticateToken,
  (req, res) => {
    upload.single("screenshot")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Upload failed." });
      }
      try {
        const { id } = req.params;
        const { userId } = req.user;
        const {
          paymentMethod,
          transactionId,
          amount,
          paidOn,
          payerName,
          phone,
          notes,
        } = req.body;

        if (!mongoose.isValidObjectId(id)) {
          return res.status(400).json({ message: "Invalid class id." });
        }

        if (!mongoose.isValidObjectId(userId)) {
          return res.status(401).json({ message: "Invalid student token." });
        }

        const amountProvided =
          amount !== undefined && amount !== null && String(amount).trim() !== "";
        const hasPaymentDetails = Boolean(
          transactionId ||
            amountProvided ||
            paidOn ||
            payerName ||
            phone ||
            req.file
        );

        if (hasPaymentDetails) {
          if (
            !paymentMethod ||
            !transactionId ||
            !amountProvided ||
            !paidOn ||
            !payerName ||
            !phone
          ) {
            return res.status(400).json({
              message:
                "paymentMethod, transactionId, amount, paidOn, payerName, and phone are required when submitting payment details.",
            });
          }
        }

        let parsedAmount = 0;
        let paidDate = null;
        if (hasPaymentDetails) {
          parsedAmount = Number(amount);
          if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
              message: "Amount must be a valid number greater than zero.",
            });
          }

          paidDate = new Date(paidOn);
          if (Number.isNaN(paidDate.getTime())) {
            return res.status(400).json({ message: "paidOn must be a valid date." });
          }
        }

        const classExists = await Classes.findById(id);
        if (!classExists) {
          return res.status(404).json({ message: "Class not found." });
        }

        const student = await Students.findById(userId).select("grade classes");
        if (!student) {
          return res.status(404).json({ message: "Student not found." });
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

        const alreadyEnrolled = (student.classes || []).some(
          (classId) => String(classId) === String(id)
        );
        if (alreadyEnrolled) {
          return res.status(409).json({
            message: "You are already enrolled in this course.",
          });
        }

        const existingPending = await PaymentRequest.findOne({
          studentId: userId,
          classId: id,
          status: "pending",
        });
        if (existingPending) {
          return res.status(409).json({
            message: "Payment request already submitted for this course.",
          });
        }

        let screenshotUrl = "";
        if (hasPaymentDetails && req.file) {
          if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
          ) {
            console.warn("Cloudinary config missing; skipping screenshot upload.");
          } else {
            try {
              const uploaded = await uploadToCloudinary(req.file.buffer, {
                public_id: `payment-${userId}-${Date.now()}`,
              });
              screenshotUrl = uploaded?.secure_url || "";
            } catch (uploadError) {
              console.error("Screenshot upload failed:", uploadError);
            }
          }
        }

        const request = await PaymentRequest.create({
          studentId: userId,
          classId: id,
          paymentMethod: hasPaymentDetails ? String(paymentMethod).trim() : "",
          transactionId: hasPaymentDetails ? String(transactionId).trim() : "",
          amount: parsedAmount,
          paidOn: paidDate,
          payerName: hasPaymentDetails ? String(payerName).trim() : "",
          phone: hasPaymentDetails ? String(phone).trim() : "",
          notes: notes ? String(notes).trim() : "",
          screenshotUrl,
        });

        await Students.findByIdAndUpdate(userId, {
          $addToSet: { appliedClasses: id },
        });
        await Classes.findByIdAndUpdate(id, {
          $addToSet: { appliedStudents: userId },
        });

        return res.status(201).json({
          message: "Payment request submitted successfully.",
          requestId: request._id,
        });
      } catch (error) {
        console.error("Payment request error:", error);
        if (error?.name === "ValidationError") {
          return res.status(400).json({
            message: "Payment request data is invalid.",
          });
        }
        if (error?.name === "CastError") {
          return res.status(400).json({
            message: "Invalid identifier provided.",
          });
        }
        return res.status(500).json({ message: "Unable to submit request." });
      }
    });
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
