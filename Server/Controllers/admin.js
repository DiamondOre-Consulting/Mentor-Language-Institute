import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../Models/Admin.js";
import AdminAuthenticateToken from "../Middlewares/AdminAuthenticateToken.js";
import Classes from "../Models/Classes.js";
import Teachers from "../Models/Teachers.js";
import Parents from "../Models/Parents.js";
import Students from "../Models/Students.js";
import Fee from "../Models/Fee.js";
import Attendance from "../Models/Attendance.js";

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
    const { name, username, phone, password } = req.body;

    const teacher = Teachers.exists({ phone });

    if (!teacher) {
      return res.status(409).json({ message: "Admin user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = {};
    if (name && username && phone) {
      const newTeacher = new Teachers({
        name,
        username: name + "-" + phone,
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
    const allTeachers = await Teachers.find({ password: 0 });

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

// ADD PARENT
router.post("/add-parent", AdminAuthenticateToken, async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    const adminuser = Parents.exists({ phone });

    if (adminuser) {
      return res.status(409).json({ message: "Parent user already exists" });
    }

    if (!name || !phone || !password) {
      return res.status(409).json({ message: "All fields are required!!!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newParent = new Parents({
      role: "Parent",
      name,
      username: name + "-" + phone,
      phone,
      password: hashedPassword,
    });

    await newParent.save();

    res.status(200).json({ message: "New parent has added!!! ", newParent });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET ALL PARENTS
router.get("/all-parents", AdminAuthenticateToken, async (req, res) => {
  try {
    const allParents = await Parents.find({}, {password: 0});

    return res.status(200).json(allParents);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET PARENT BY ID
router.get("/all-parents/:id", AdminAuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const singleParent = await Parents.findById({ _id: id });

    return res.status(200).json(singleParent);
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// ADD STUDENT
router.post("/add-student", AdminAuthenticateToken, async (req, res) => {
  try {
    const { name, parentId, classId, feeMonth, paid, completedHours } = req.body;

    const parent = await Parents.findById({ _id: parentId });

    for (const studentId of parent.wards) {
      // Find student by ID
      const student = await Students.findById(studentId);
      if (!student) {
        // Handle case where student doesn't exist (optional)
        console.log(`Student with ID ${studentId} not found.`);
        continue; // Continue to next iteration
      }
      // Compare student names
      if (student.name === name) {
        return res
          .status(400)
          .json({ error: "Student already exists for the particular parent" });
      }
    }

    const newStudent = new Students({
      name,
      parent: parentId,
      classes: classId,
    });

    await newStudent.save();

    if (newStudent) {
      const updateParent = await Parents.findByIdAndUpdate(
        { _id: parentId },
        {
          $push: { wards: newStudent._id },
        }
      );
    }

    if (newStudent) {
      const updateClass = await Classes.findByIdAndUpdate(
        {_id: classId},
        {
          $push: {enrolledStudents: newStudent._id}
        }
      )
    }

    if(newStudent) {
      await Fee.create({
        classId,
        studentId: newStudent._id,
        detailFee: [{ feeMonth, paid }],
      });
    }

    if(newStudent) {
      await Attendance.create({
        classId,
        studentId: newStudent._id,
        completedHours,
      })
    }

    return res.status(200).json({message: `New student ${name} has been added under parent ${parent.name}!!!`})
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET ALL STUDENTS
router.get('/all-students', AdminAuthenticateToken, async (req, res) => {
  try {
    const allStudents = await Students.find({});

    return res.status(200).json(allStudents);

  } catch(error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
})

// GET STUDENT BY ID
router.get('/all-students/:id', AdminAuthenticateToken, async (req, res) => {
  try {
    const {id} = req.params;

    const singleStudent = await Students.findById({_id: id});

    return res.status(200).json(singleStudent);
  } catch(error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// UPDATE FEE DETAIL
router.put('/update-fee', AdminAuthenticateToken, async (req, res) => {
  try {
    const {classId, studentId, feeMonth } = req.body;

    await Fee.findOneAndUpdate(
      {classId, studentId},
      {
        $push: {
          detailFee: {
            feeMonth,
            paid: true
          }
        }
      }
    )

    res.status(200).json({ message: 'Fee updated successfully.' });
  } catch(error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
})

export default router;
