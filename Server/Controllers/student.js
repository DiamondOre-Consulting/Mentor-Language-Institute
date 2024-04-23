import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Students from "../Models/Students.js";
import StudentAuthenticateToken from "../Middlewares/StudentAuthenticateToken.js";
import Classes from "../Models/Classes.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import Teachers from "../Models/Teachers.js";

dotenv.config();

const secretKey = process.env.STUDENT_JWT_SECRET;

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await Students.findOne({ phone });
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

router.get("/my-profile", StudentAuthenticateToken, async (req, res) => {
  try {
    const { phone } = req.user;

    const student = await Students.findOne({ phone: phone });

    if (!student) {
      return res.status(404).json({ message: "Student not find" });
    }

    const { name, appliedClasses, classes, attendanceDetail, feeDetail } =
      student;
    res.status(200).json({
      name,
      phone,
      appliedClasses,
      classes,
      attendanceDetail,
      feeDetail,
    });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.get("/all-courses", StudentAuthenticateToken, async (req, res) => {
  try {
    const allCourses = await Classes.find({});

    res.status(200).json(allCourses);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.get("/all-courses/:id", StudentAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const singleCourse = await Classes.findById({ _id: id });

    res.status(200).json(singleCourse);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.get("/teacher/:id", StudentAuthenticateToken, async (req, res) => {
    try {
        const {id} = req.params;

        const myTeacher = await Teachers.findById({_id: id});

        if(!myTeacher) {
            return res.status(409).json({message: "Teacher not found"});
        }

        res.status(200).json(myTeacher);
    } catch(error) {
        console.log("Something went wrong!!! ");
        res.status(500).json(error);
    }
})

router.post("/apply-course/:id", StudentAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const userApplied = await Classes.findOne({ appliedStudents: userId });
    if (userApplied) {
      return res
        .status(409)
        .json({ message: "Student has already applied in this course!!!" });
    }

    const userRegistered = await Classes.findOne({ enrolledStudents: userId });
    if (userRegistered) {
      return res
        .status(408)
        .json({ message: "Student has already registered in this course!!!" });
    }

    const classUpdate = await Classes.findOneAndUpdate(
      { _id: id },
      {
        $push: { appliedStudents: userId },
      },
      { new: true }
    );

    const studentUpdate = await Students.findOneAndUpdate(
      { _id: userId },
      {
        $push: { appliedClasses: id },
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

      const userRegistered = await Classes.findOne({
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
          $push: { enrolledStudents: userId },
        },
        { new: true }
      );

      if (updateClass) {
        // UPDATE CLASS ACCESS STATUS
        const newClassAccessStatus = new ClassAccessStatus({
          classId: id,
          studentId: userId,
          classAccessStatus: true,
        });

        await newClassAccessStatus.save();

        // UPDATE FEE FIRST TIME
        // let forUpdate = totalFee-amountPaid;
        const feeUpdate = new Fee({
          classId: id,
          studentId: userId,
          totalFee,
          detailFee: [
            {
              feeMonth,
              paid,
              amountPaid,
            },
          ],
        });

        await feeUpdate.save();

        // UPDATE STUDENT
        const updateStudent = await Students.findByIdAndUpdate(
          { _id: userId },
          {
            $push: { classes: id, feeDetail: feeUpdate._id },
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

export default router;
