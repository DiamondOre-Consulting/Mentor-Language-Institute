import express from "express";
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

router.get("/my-classes", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const allMyClasses = await Classes.find({ teachBy: userId });

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

      const addNewClass = await Classes.findByIdAndUpdate(
        { _id: id },
        {
          $push: { dailyClasses: {classDate: date, numberOfClasses: numberOfClasses} },
        },
        { new: true }
      );

      // Get all student ids
      const allStudents = await Students.find({}, { _id: 1 });

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

      res
        .status(200)
        .json({
          message:
            "Total hours of the class has been increased successfully!!!",
        });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error);
    }
  }
);

router.get(
  "/attendance/:id",
  TeacherAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { attendanceDate } = req.body;

      const attendances = await Attendance.find({
        classId: id,
        "detailAttendance.classDate": attendanceDate,
      });

      if(!attendances) {
        return res.status(403).json({message: "No record found!!!"});
      }

      res.status(200).json(attendances);
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

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
router.get("/my-commission", TeacherAuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const myCommission = await Commission.findOne({ teacherId: userId });

    if (!myCommission) {
      return res.status(403).json({ message: "No record found!!!" });
    }

    res.status(200).json(myCommission);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// UPDATE MONTHLY COMMISSION
router.post("/update-monthly-classes/:id", TeacherAuthenticateToken, async (req, res) => {
  try {
    const {id} = req.params;
    const {classesTaken} = req.body;

    const updateClassesTaken = await Commission.findOneAndUpdate(
      {_id: id},
      {
        $set: {classesTaken: classesTaken}
      }
    )

    if(!updateClassesTaken) {
      return res.status(403).json({message: "No record found!!!"});
    }

    res.status(200).json({message: "Monthly classes taken updated successfully!!!"})
  } catch(error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
})

export default router;
