import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../Models/Admin.js";
import AdminAuthenticateToken from "../Middlewares/AdminAuthenticateToken.js";
import Classes from "../Models/Classes.js";
import Teachers from "../Models/Teachers.js";
import Students from "../Models/Students.js";
import Fee from "../Models/Fee.js";
import ClassAccessStatus from "../Models/ClassAccessStatus.js";
import Attendance from "../Models/Attendance.js";
import Commission from "../Models/Commission.js";

dotenv.config();

const secretKey = process.env.ADMIN_JWT_SECRET;

const router = express.Router();

// SIGNUP AS ADMIN
router.post("/signup-admin", async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    const adminuser = Admin.exists({ phone });

    if (!adminuser) {
      return res.status(409).json({ message: "Admin user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      role: "admin",
      name,
      username: name + "-" + phone,
      phone,
      password: hashedPassword,
    });

    await newAdmin.save();

    return res.status(201).json({ message: "Admin User created successfully" });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// LOGIN AS ADMIN
router.post("/login-admin", async (req, res) => {
  try {
    const { username, password } = req.body;
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
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        role: user.role,
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

// OWN DATA
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

// ADD CLASS BY ADMIN
router.post("/add-new-class", AdminAuthenticateToken, async (req, res) => {
  try {
    const { phone } = req.user;
    const { classTitle, classSchedule, teachBy, totalHours } = req.body;

    const admin = await Admin.findOne({ phone: phone });

    if (!admin) {
      return res.status(404).json({ message: "Admin not find" });
    }

    const newClass = new Classes({
      classTitle,
      classSchedule,
      teachBy,
      totalHours,
    });

    await newClass.save();

    const updateTeacher = await Teachers.findByIdAndUpdate(
      { _id: teachBy },
      {
        $push: { myClasses: newClass._id },
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "new class has added!!!", newClass });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET ALL CLASSES
router.get("/all-classes", AdminAuthenticateToken, async (req, res) => {
  try {
    const allClasses = await Classes.find({});

    return res.status(200).json(allClasses);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET CLASS BY ID
router.get("/all-classes/:id", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const singleClass = await Classes.findById({ _id: id });

    return res.status(200).json(singleClass);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ADD TEACHER
router.post("/add-teacher", AdminAuthenticateToken, async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    const teacher = await Teachers.exists({ phone });

    if (teacher) {
      return res
        .status(409)
        .json({ message: "Teacher has already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = {};
    if (name && phone && password) {
      const newTeacher = new Teachers({
        role: "Teacher",
        name,
        phone,
        password: hashedPassword,
      });

      await newTeacher.save();
    }
    return res
      .status(200)
      .json({ message: "new teacher has added!!!", newTeacher });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET ALL TEACHERS
router.get("/all-teachers", AdminAuthenticateToken, async (req, res) => {
  try {
    const allTeachers = await Teachers.find({}, { password: 0 });

    return res.status(200).json(allTeachers);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET TEACHER BY ID
router.get("/all-teachers/:id", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const singleTeacher = await Teachers.findById({ _id: id });

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
    const { name, phone, password } = req.body;

    const studentUser = await Students.findOne({ phone });

    if (studentUser) {
      return res
        .status(409)
        .json({ message: "Student with this phone number already exist!!!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Students({
      name,
      phone,
      password: hashedPassword,
    });

    await newStudent.save();

    return res
      .status(200)
      .json({ message: `New student has been registered successfully!!!` });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET ALL STUDENTS
router.get("/all-students", AdminAuthenticateToken, async (req, res) => {
  try {
    const allStudents = await Students.find({});

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

    const singleStudent = await Students.findById({ _id: id });

    return res.status(200).json(singleStudent);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ENROLL STUDENT IN A COURSE
router.put("/enroll-student/:id1/:id2", async (req, res) => {
  try {
    const { id1, id2 } = req.params;
    const { totalFee, feeMonth, paid, amountPaid } = req.body;

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
        $push: { enrolledStudents: id2 },
      },
      { new: true }
    );

    if (updateClass) {
      // UPDATE CLASS ACCESS STATUS
      const newClassAccessStatus = new ClassAccessStatus({
        classId: id1,
        studentId: id2,
        classAccessStatus: true,
      });

      await newClassAccessStatus.save();

      // UPDATE FEE FIRST TIME
      // let forUpdate = totalFee-amountPaid;
      const feeUpdate = new Fee({
        classId: id1,
        studentId: id2,
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
        { _id: id2 },
        {
          $push: { classes: id1, feeDetail: feeUpdate._id },
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
    }

    return res.status(200).json({
      message: `Student with ${id2} is enrolled in course ${id1} successfully!!!`,
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
      const { feeMonth, paid, amountPaid } = req.body;

      await Fee.findOneAndUpdate(
        { classId: id1, studentId: id2 },
        {
          $push: {
            detailFee: {
              feeMonth,
              paid,
              amountPaid,
            },
          },
        }
      );

      res
        .status(200)
        .json({ message: `Fee for ${feeMonth} is updated successfully.` });
    } catch (error) {
      console.log("Something went wrong!!! ");
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
    const { attendanceDate } = req.query; // Change req.body to req.query

    const attendances = await Attendance.find({
      classId: id,
      "detailAttendance.classDate": attendanceDate,
    });

    if (attendances.length === 0) {
      // Check if the length is zero
      return res.status(403).json({ message: "No record found!!!" });
    }

    res.status(200).json(attendances);
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
      const { commission, classDate } = req.body;
      const { id1, id2 } = req.params;

      const updateCommission = await Attendance.findOneAndUpdate(
        {
          classId: id1,
          studentId: id2,
          "detailAttendance.classDate": classDate,
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
  "/monthly-commission/:id",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const commissionById = await Commission.findOne({ teacherId: id });
      if (!commissionById) {
        return res.status(403).json({ message: "No record found!!!" });
      }

      res.status(200).json(commissionById);
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
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
      const { commission, paid } = req.body;

      if (!commission) {
        await Commission.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              paid: paid,
            },
          }
        );
      }

      const updateMonthlyCommission = await Commission.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            commission: commission,
            paid: paid,
          },
        }
      );

      if (!updateMonthlyCommission) {
        return res.status(403).json({ message: "Record not found!!!" });
      }

      res
        .status(200)
        .json({ message: "Monthly commission updated successfully" });
    } catch (error) {
      console.log("Something went wrong!!! ");
      res.status(500).json(error);
    }
  }
);

export default router;
