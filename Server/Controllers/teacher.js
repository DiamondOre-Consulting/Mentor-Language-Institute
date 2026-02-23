import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Teachers from "../Models/Teachers.js";
import TeacherAuthenticateToken from "../Middlewares/TeacherAuthenticateToken.js";
import Classes from "../Models/Classes.js";
import Students from "../Models/Students.js";
import Attendance from "../Models/Attendance.js";
import Commission from "../Models/Commission.js";
import ClassTeachers from "../Models/ClassTeachers.js";
import ExcelJS from "exceljs";
import crypto from 'crypto';
import { calculateMonthlyCommission, sortCommissions } from "../utils/commission.js";
import { isGradeMatch, resolveCourseGrade, toGradeLabel } from "../utils/grade.js";
import { getAssignmentForTeacher } from "../utils/classTeachers.js";
import {
  findStudentUniquenessConflict,
  isValidEmail,
  normalizeEmail,
} from "../utils/studentValidation.js";



dotenv.config();

const secretKey = process.env.TEACHER_JWT_SECRET;

const router = express.Router();

router.post("/login-teacher", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await Teachers.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: "Invalid phone number" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(402).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        phone: user.phone,
      },
      secretKey,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});



// MY PROFILE
router.get("/my-profile", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId, role, name, phone } = req.user;

    const myProfile = await Teachers.findById({ _id: userId });

    if (!myProfile) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const assignments = await ClassTeachers.find({
      teacherId: userId,
      active: true,
    }).select("classId");
    const myClasses = assignments.map((a) => a.classId);
    const { myScheduledClasses } = myProfile;
    res.status(200).json({
      userId,
      role,
      name,
      phone,
      myClasses,
      myScheduledClasses,
    });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
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
      classData.enrolledStudents.push(newStudent._id);
      await classData.save();
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

router.delete("/delete-student/:id",TeacherAuthenticateToken,async (req, res) => {
    try {
      const { id } = req.params;

      const deleteStudent = await Students.findByIdAndDelete({ _id: id });
      if (!deleteStudent) {
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
      const { date, numberOfClasses } = req.body;

      const assignment = await ClassTeachers.findOne({
        classId: id,
        teacherId: req.user.userId,
        active: true,
      });
      if (!assignment) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const addNewClass = await Classes.findByIdAndUpdate(
        { _id: id },
        {
          $push: {
            dailyClasses: { classDate: date, numberOfClasses: numberOfClasses },
          },
        },
        { new: true }
      );

      const studentIds = addNewClass?.enrolledStudents || [];

      // Check if there's an existing document in Attendance collection for each student
      for (const studentId of studentIds) {
        const existingAttendance = await Attendance.findOne({
          classId: id,
          studentId,
        });

        if (existingAttendance) {
          // If existing document found, update it
          await Attendance.findByIdAndUpdate(
            existingAttendance._id,
            {
              $push: { detailAttendance: { classDate: date, teacherId: req.user.userId } },
            },
            { new: true }
          );

          // MY SCHEDULED CLASSES DATES IS LEFT
        } else {
          // If no existing document found, create a new one
          const newAttendance = new Attendance({
            classId: id,
            studentId,
            detailAttendance: [{ classDate: date, teacherId: req.user.userId }],
          });

          await newAttendance.save();

          const pushScheduledClass = await Students.findByIdAndUpdate(
            { _id: studentId },
            {
              $push: { attendanceDetail: newAttendance._id },
            },
            { new: true }
          );
        }
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
        { $inc: { totalHours: updatedHours } },
        { new: true }
      );

      res.status(200).json({
        message: "Total hours of the class has been increased successfully!!!",
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
    const { attendanceDate } = req.query;

    const attendances = await Attendance.find({
      classId: id,
      "detailAttendance.classDate": attendanceDate,
    });

    if (!attendances) {
      return res.status(403).json({ message: "No record found!!!" });
    }

    const filtered = attendances.map((doc) => {
      const detailAttendance = (doc.detailAttendance || []).filter(
        (entry) =>
          entry.classDate === attendanceDate &&
          String(entry.teacherId) === String(req.user.userId)
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
      const { attendanceDate, numberOfClassesTaken } = req.body;

      const assignment = await getAssignmentForTeacher(id1, req.user.userId);
      if (!assignment) {
        return res.status(403).json({ message: "Unauthorized." });
      }
      const rate = Number.isFinite(Number(assignment?.commissionRate))
        ? Number(assignment.commissionRate)
        : Number(process.env.DEFAULT_COMMISSION_RATE || 1);
      const units = Number(numberOfClassesTaken || 0);
      const computedCommission = Number.isFinite(units)
        ? Number((units * rate).toFixed(2))
        : 0;

      const updatedAttendance = await Attendance.findOneAndUpdate(
        {
          classId: id1,
          studentId: id2,
          "detailAttendance.classDate": attendanceDate,
          "detailAttendance.teacherId": req.user.userId,
        },
        {
          $set: {
            "detailAttendance.$.numberOfClassesTaken": numberOfClassesTaken,
            "detailAttendance.$.commission": computedCommission,
          },
        },
        { new: true }
      );

      if (!updatedAttendance) {
        return res
          .status(404)
          .json({ message: "Attendance record not found." });
      }

      res.status(200).json(updatedAttendance);
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error);
    }
  }
);

// BULK MARK ATTENDANCE FOR A CLASS DATE
router.post(
  "/attendance/bulk/:classId",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { classDate, numberOfClasses, presentStudentIds = [] } = req.body;

      if (!classDate || numberOfClasses === undefined) {
        return res
          .status(400)
          .json({ message: "classDate and numberOfClasses are required." });
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

      const normalizedHours = Number(numberOfClasses) || 0;
      const presentSet = new Set(
        (presentStudentIds || []).map((id) => String(id))
      );

      const rate = Number.isFinite(Number(assignment?.commissionRate))
        ? Number(assignment.commissionRate)
        : Number(process.env.DEFAULT_COMMISSION_RATE || 1);

      const existingSessionIndex = (classDoc.dailyClasses || []).findIndex(
        (d) => d.classDate === classDate
      );

      if (existingSessionIndex >= 0) {
        classDoc.dailyClasses[existingSessionIndex].numberOfClasses =
          String(normalizedHours);
      } else {
        classDoc.dailyClasses.push({
          classDate,
          numberOfClasses: String(normalizedHours),
        });
      }

      await classDoc.save();

      const enrolledStudents = classDoc.enrolledStudents || [];

      for (const studentId of enrolledStudents) {
        const isPresent = presentSet.has(String(studentId));
        const units = isPresent ? normalizedHours : 0;
        const computedCommission = Number((units * rate).toFixed(2));

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
          (entry) =>
            entry.classDate === classDate &&
            String(entry.teacherId) === String(req.user.userId)
        );

        if (detail) {
          detail.numberOfClassesTaken = units;
          detail.commission = computedCommission;
        } else {
          attendanceDoc.detailAttendance.push({
            classDate,
            numberOfClassesTaken: units,
            commission: computedCommission,
            teacherId: req.user.userId,
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

    const student = await Students.findById({ _id: id }, { password: 0 });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
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

// CHATTING LIST OF STUDENTS
router.get("/chat-all-students", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const assignments = await ClassTeachers.find({
      teacherId: userId,
      active: true,
    }).select("classId");
    const myClasses = assignments.map((a) => a.classId);

    let allStudentIds = [];

    await Promise.all(
      myClasses.map(async (eachClass) => {
        const currentClass = await Classes.findById(eachClass);
        currentClass.enrolledStudents.forEach((studentId) => {
          const stringId = String(studentId).trim().toLowerCase();
          if (!allStudentIds.includes(stringId)) {
            allStudentIds.push(stringId);
          }
        });
      })
    );

    const objectIds = allStudentIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const students = await Promise.all(
      objectIds.map((id) => Students.findById(id, { password: 0 }))
    );

    const filteredStudents = students.filter((student) => student !== null);

    res.status(201).json(filteredStudents);
  } catch (error) {
    console.log("Something went wrong!!! ", error);
    res.status(500).json(error);
  }
});

router.post(
  "/mark-attendance/:studentId/:classId",
  TeacherAuthenticateToken,
  async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classDate, numberOfClassesTaken, grade } = req.body;
    if (!classDate || !numberOfClassesTaken) {
      return res
        .status(400)
        .json({ message: "Missing classDate or numberOfClassesTaken." });
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
    const rate = Number.isFinite(Number(assignment?.commissionRate))
      ? Number(assignment.commissionRate)
      : Number(process.env.DEFAULT_COMMISSION_RATE || 1);
    const units = Number(numberOfClassesTaken || 0);
    const computedCommission = Number.isFinite(units)
      ? Number((units * rate).toFixed(2))
      : 0;

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
          },
        ],
      });
    } else {
      attendance.detailAttendance.push({
        classDate,
        numberOfClassesTaken,
        grade,
        commission: computedCommission,
        teacherId: req.user.userId,
      });
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
      const { classDate, numberOfClassesTaken, grade } = req.body;

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
      const rate = Number.isFinite(Number(assignment?.commissionRate))
        ? Number(assignment.commissionRate)
        : Number(process.env.DEFAULT_COMMISSION_RATE || 1);
      const units = Number(numberOfClassesTaken || 0);
      const computedCommission = Number.isFinite(units)
        ? Number((units * rate).toFixed(2))
        : 0;

      // Update fields
      if (String(attendanceEntry.teacherId) !== String(req.user.userId)) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      attendanceEntry.classDate = classDate; // optional, if you want to update date
      attendanceEntry.numberOfClassesTaken = numberOfClassesTaken;
      attendanceEntry.grade = grade;
      attendanceEntry.commission = computedCommission;

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

    const attendanceRecord = student.attendanceDetail?.[0];

    if (!attendanceRecord) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    const detailAttendance = (attendanceRecord.detailAttendance || []).filter(
      (entry) => String(entry.teacherId) === String(req.user.userId)
    );

    const filteredAttendance = detailAttendance.filter((entry) => {
      const [day, entryMonth, entryYear] = entry.classDate.split("-");
      if (year && entryYear !== year) return false;
      if (month && entryMonth !== month) return false;
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

export default router;
