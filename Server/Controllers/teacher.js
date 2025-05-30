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
        branch: user.branch,
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

    const { myClasses, myScheduledClasses } = myProfile;
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
    const { userId, branch } = req.user; // Teacher details from token
    const { name, phone, password, userName, dob, courseId } = req.body;

    // Check if the class exists and is assigned to the teacher
    const classData = await Classes.findOne({ _id: courseId, teachBy: userId });
    if (!classData) {
      return res.status(404).json({ message: "Class not found or unauthorized" });
    }

    // Check if a student with the given username already exists
    const studentUser = await Students.findOne({ userName });
    if (studentUser) {
      return res.status(400).json({ message: "Student with this username already exists!!!" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new student
    const newStudent = new Students({
      branch: branch,
      teachBy: userId,
      userName,
      dob,
      name,
      phone,
      password: hashedPassword,
      classes: courseId,
    });

    await newStudent.save();


  await Teachers.updateMany(
      { branch },
      { $push: { myStudents: newStudent._id } }
    );
    // Add the student to the enrolled students array in the class
    classData.enrolledStudents.push(newStudent._id);
    await classData.save();

    return res
      .status(200)
      .json({ message: `New student has been registered successfully!!!` });
  } catch (error) {
    console.log("Something went wrong!!! ", error.message);
    res.status(500).json(error);
  }
});

router.get("/my-students", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

   
    const teacher = await Teachers.findById(userId)
      .populate({
        path: "myClasses",
        populate: {
          path: "enrolledStudents",
          model: "Student",
          select: "-password", 
        },
      });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    const allStudents = teacher.myClasses.flatMap(cls => cls.enrolledStudents);

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
  const { name, phone, password, branch, userName, dob } = req.body;
  console.log(name, phone, password, branch, userName, dob);

  try {
    // Validate input fields (optional, depending on your requirements)

    // Find the student by ID
    const student = await Students.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Check if username already exists (excluding the current student)
    const existingUserName = await Students.findOne({ userName });
    console.log(existingUserName);
    if (existingUserName && existingUserName._id.toString() !== id) {
      return res.status(400).json({
        message: "Username already taken. Please enter a unique username",
      });
    }

    // Update student details
    // student.name = name || student.name;
    // student.phone = phone || student.phone;
    // student.branch = branch || student.branch;
    // student.userName = userName || student.userName;
    // student.dob = dob || student.dob;
    if (name) {
      student.name = await name;
    }
    if (phone) {
      student.phone = await phone;
    }
    if (branch) {
      student.branch = await branch;
    }
    if (userName) {
      student.userName = await userName;
    }
    if (dob) {
      student.dob = await dob;
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
    res.status(500).json({ message: "Server error." });
  }
});



router.delete(
  "/delete-student/:id",
  TeacherAuthenticateToken,
  async (req, res) => {
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
    const { userId, branch } = req.user;

    const allMyClasses = await Classes.find({
      teachBy: userId,
      branch: branch,
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
router.post(
  "/schedule-class/:id",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { date, numberOfClasses } = req.body;
      const { branch } = req.user;

      const addNewClass = await Classes.findByIdAndUpdate(
        { _id: id },
        {
          $push: {
            dailyClasses: { classDate: date, numberOfClasses: numberOfClasses },
          },
        },
        { new: true }
      );

      // Get all student ids
      const allStudents = await Students.find({ branch: branch }, { _id: 1 });

      const studentIds = allStudents.map((student) => student._id);

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
              $push: { detailAttendance: { classDate: date } },
            },
            { new: true }
          );

          // MY SCHEDULED CLASSES DATES IS LEFT
        } else {
          // If no existing document found, create a new one
          const studentExist = await Classes.findOne({
            _id: id,
            enrolledStudents: studentId,
          });
          if (!studentExist) {
            console.log(
              `Student with ID ${studentId} is not enrolled in this course. Skipping...`
            );
            continue;
          }
          const newAttendance = new Attendance({
            classId: id,
            studentId,
            detailAttendance: [{ classDate: date }],
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
router.put(
  "/update-class-hours/:id",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { updatedHours } = req.body;

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

    res.status(200).json(attendances);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.put(
  "/update-attendance/:id1/:id2",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { id1, id2 } = req.params;
      const { attendanceDate, numberOfClassesTaken } = req.body;

      const updatedAttendance = await Attendance.findOneAndUpdate(
        {
          classId: id1,
          studentId: id2,
          "detailAttendance.classDate": attendanceDate,
        },
        {
          $set: {
            "detailAttendance.$.numberOfClassesTaken": numberOfClassesTaken,
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

    const myCommission = await Commission.find({
      teacherId: userId,
      classId: id,
    });

    if (!myCommission) {
      return res.status(403).json({ message: "No record found!!!" });
    }

    res.status(200).json(myCommission);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ADD MONTHLY COMMISSION
router.post(
  "/add-monthly-classes/:id",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const { monthName, year, classesTaken } = req.body;

      const addClassesTaken = new Commission({
        teacherId: userId,
        classId: id,
        monthName,
        year,
        classesTaken,
      });

      await addClassesTaken.save();

      if (!addClassesTaken) {
        return res.status(403).json({ message: "Error in adding classes" });
      }

      res.status(200).json({
        message: "Monthly classes taken added successfully!!!",
        addClassesTaken,
      });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error);
    }
  }
);

// CHATTING LIST OF STUDENTS
router.get("/chat-all-students", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const currentUser = await Teachers.findById(userId);
    const myClasses = currentUser.myClasses;

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

    const objectIds = allStudentIds.map(id => new mongoose.Types.ObjectId(id));

    const students = await Promise.all(
      objectIds.map(id => Students.findById(id))
    );

    const filteredStudents = students.filter(student => student !== null);

    res.status(201).json(filteredStudents);
  } catch (error) {
    console.log("Something went wrong!!! ", error);
    res.status(500).json(error);
  }
});



export default router;
