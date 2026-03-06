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
import Notification from "../Models/Notification.js";
import { createRefreshTokenRecord, setAccessCookie, setRefreshCookie, signAccessToken } from "../utils/authTokens.js";
import {
  isGradeMatch,
  normalizeGradeValue,
  resolveCourseGrade,
  toGradeLabel,
} from "../utils/grade.js";
import { normalizeFeeMonths, normalizeFeeYear } from "../utils/fee.js";
import {
  findStudentUniquenessConflict,
  isValidEmail,
  normalizeEmail,
} from "../utils/studentValidation.js";
import { isValidPhone, normalizePhone } from "../utils/phone.js";

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
    setAccessCookie(res, token);
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

// STUDENT NOTIFICATIONS
router.get("/notifications", StudentAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 50);
    const unread = String(req.query.unread || "").toLowerCase() === "true";

    const query = { userId };
    if (unread) {
      query.readAt = null;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

router.get("/notifications/unread-count", StudentAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const count = await Notification.countDocuments({
      userId,
      readAt: null,
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Failed to count notifications:", error);
    res.status(500).json({ message: "Failed to count notifications." });
  }
});

router.put("/notifications/mark-read", StudentAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { ids = [] } = req.body || {};
    const normalizedIds = Array.isArray(ids)
      ? ids.map((id) => String(id)).filter(Boolean)
      : [];
    if (normalizedIds.length === 0) {
      return res.status(400).json({ message: "Notification ids are required." });
    }

    const result = await Notification.updateMany(
      { _id: { $in: normalizedIds }, userId },
      { $set: { readAt: new Date() } }
    );

    res.status(200).json({ updated: result.modifiedCount || 0 });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    res.status(500).json({ message: "Failed to update notifications." });
  }
});

router.put("/notifications/mark-all-read", StudentAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await Notification.updateMany(
      { userId, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.status(200).json({ updated: result.modifiedCount || 0 });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    res.status(500).json({ message: "Failed to update notifications." });
  }
});

// STUDENT PAYMENT REQUESTS
router.get("/payment-requests", StudentAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { status, type } = req.query;
    const query = { studentId: userId };
    if (status) {
      query.status = String(status).toLowerCase();
    }
    if (type) {
      query.requestType = String(type).toLowerCase();
    }

    const requests = await PaymentRequest.find(query)
      .sort({ createdAt: -1 })
      .select("classId feeMonth feeYear status requestType createdAt")
      .lean();

    res.status(200).json(requests);
  } catch (error) {
    console.error("Failed to fetch student payment requests:", error);
    res.status(500).json({ message: "Failed to fetch payment requests." });
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
    const student = await Students.findById(req.user.userId).select("grade classes");
    const studentGrade = normalizeGradeValue(student?.grade);
    const enrolledSet = new Set((student?.classes || []).map((id) => String(id)));
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

    const sanitizedCourses = filteredCourses.map((course) => {
      const isEnrolled = enrolledSet.has(String(course._id));
      if (!isEnrolled) {
        return { ...course, dailyClasses: [], isEnrolled };
      }
      return { ...course, isEnrolled };
    });

    res.status(200).json(sanitizedCourses);
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
    const isEnrolled = (student?.classes || []).some(
      (classId) => String(classId) === String(id)
    );
    if (!isGradeMatch(singleCourse?.grade, student?.grade)) {
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

    const coursePayload = {
      ...singleCourse.toObject(),
      teachers,
      isEnrolled,
    };
    if (!isEnrolled) {
      coursePayload.dailyClasses = [];
    }

    res.status(200).json(coursePayload);
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
            const normalizedPhone = normalizePhone(phone);
            if (!isValidPhone(normalizedPhone)) {
              return res.status(400).json({ message: "Phone number must be 10 digits." });
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

        const alreadyEnrolled = (student.classes || []).some(
          (classId) => String(classId) === String(id)
        );
        const now = new Date();
        const requestedMonths = alreadyEnrolled
          ? normalizeFeeMonths(req.body?.feeMonths ?? req.body?.feeMonth)
          : [];
        const providedYear = normalizeFeeYear(req.body?.feeYear);
        if (req.body?.feeYear && !providedYear) {
          return res.status(400).json({
            message: "Fee year must be a valid year (e.g., 2026).",
          });
        }
        const normalizedFeeYear = providedYear || now.getFullYear();
        if (!alreadyEnrolled) {
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
        } else if (!requestedMonths.length) {
          return res.status(400).json({
            message: "Fee month is required for fee payment requests.",
          });
        }

        let monthsToCreate = [];
        let skippedMonths = [];
        if (alreadyEnrolled) {
          const existingPending = await PaymentRequest.find({
            studentId: userId,
            classId: id,
            status: "pending",
            requestType: "fee_payment",
            feeMonth: { $in: requestedMonths },
            feeYear:
              normalizedFeeYear === now.getFullYear()
                ? { $in: [normalizedFeeYear, null] }
                : normalizedFeeYear,
          }).select("feeMonth");
          const pendingSet = new Set(
            (existingPending || []).map((row) => Number(row?.feeMonth)).filter(Number.isInteger)
          );
          monthsToCreate = requestedMonths.filter((month) => !pendingSet.has(month));
          skippedMonths = requestedMonths.filter((month) => pendingSet.has(month));
          if (!monthsToCreate.length) {
            return res.status(409).json({
              message: "Payment request already submitted for selected month(s).",
            });
          }
        } else {
          const existingPending = await PaymentRequest.findOne({
            studentId: userId,
            classId: id,
            status: "pending",
            requestType: "enrollment",
          });
          if (existingPending) {
            return res.status(409).json({
              message: "Payment request already submitted for this course.",
            });
          }
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

        const basePayload = {
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
        };

        let createdRequests = [];
        if (alreadyEnrolled) {
          const payloads = monthsToCreate.map((month) => ({
            ...basePayload,
            requestType: "fee_payment",
            feeMonth: month,
            feeYear: normalizedFeeYear,
          }));
          createdRequests = await PaymentRequest.insertMany(payloads);
        } else {
          const request = await PaymentRequest.create({
            ...basePayload,
            requestType: "enrollment",
            feeMonth: null,
            feeYear: null,
          });
          createdRequests = [request];
        }

        if (!alreadyEnrolled) {
          await Students.findByIdAndUpdate(userId, {
            $addToSet: { appliedClasses: id },
          });
          await Classes.findByIdAndUpdate(id, {
            $addToSet: { appliedStudents: userId },
          });
        }

        return res.status(201).json({
          message: "Payment request submitted successfully.",
          requestIds: createdRequests.map((r) => r._id),
          createdMonths: alreadyEnrolled ? monthsToCreate : [],
          skippedMonths: alreadyEnrolled ? skippedMonths : [],
          feeYear: alreadyEnrolled ? normalizedFeeYear : null,
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
