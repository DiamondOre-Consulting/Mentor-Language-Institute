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
import ExcelJS from "exceljs";
dotenv.config();

const secretKey = process.env.ADMIN_JWT_SECRET;

const router = express.Router();

router.post("/signup-admin", async (req, res) => {
  try {
    const { name, phone, password, branch } = req.body;

    const adminuser = Admin.findOne({ phone });

    if (adminuser) {
      return res.status(409).json({ message: "Admin user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      role: "admin",
      name,
      username: name + "-" + phone,
      phone,
      branch,
      password: hashedPassword,
    });

    await newAdmin.save();

    return res.status(201).json({ message: "Admin User created successfully" });
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

router.post("/login-admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    const user = await Admin.findOne({ username });
    console.log(user);
    if (!user) {
      console.log(1);
      return res.status(401).json({ message: "Invalid username" });
    }

    console.log(2);
    // Compare the passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(3);
    console.log(passwordMatch);
    if (!passwordMatch) {
      console.log(4);
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log(5);
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        role: user.role,
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

router.get("/my-profile", AdminAuthenticateToken, async (req, res) => {
  try {
    const { phone } = req.user;

    const admin = await Admin.findOne({ phone: phone });

    if (!admin) {
      return res.status(404).json({ message: "Admin not find" });
    }

    const { branch, role, name, username, parents, teachers, classes } = admin;
    res.status(200).json({
      branch,
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
  const { name, phone, password, branch, userName, dob, grade } = req.body;
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

    if (grade) {
      student.grade = await grade;
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

// ADD CLASS BY ADMIN
router.post("/add-new-class", AdminAuthenticateToken, async (req, res) => {
  try {
    const { phone, branch } = req.user;
    const { classTitle, classSchedule, teachBy, totalHours } = req.body;

    const admin = await Admin.findOne({ phone: phone });

    if (!admin) {
      return res.status(404).json({ message: "Admin not find" });
    }

    const newClass = new Classes({
      branch: branch,
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
    const { branch } = req.user;
    if (!branch) {
      const allClasses = await Classes.find({});
      return res.status(200).json(allClasses);
    }
    const allClasses = await Classes.find({ branch: branch });

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
    const { branch } = req.user;
    const { name, phone, password, dob } = req.body;

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
        branch: branch,
        role: "Teacher",
        name,
        phone,
        dob,
        password: hashedPassword,
      });
      console.log(newTeacher);

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

//All admin

router.get("/all-admin", async (req, res) => {
  try {
    const admin = await Admin.find({}, { password: 0 });
    return res.status(200).json(admin);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/delete-admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isAdminExist = await Admin.findByIdAndDelete(id);
    return res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    console.log(error);
  }
});

router.put("/edit-admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, password } = req.body;
    console.log("this is password", password);
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found!" });
    }

    const updatedName = name || admin.name;
    const updatedPhone = phone || admin.phone;

    console.log("updatedName:", updatedName);
    console.log("updatedPhone:", updatedPhone);

    const username = `${updatedName}-${updatedPhone}`;
    console.log(username);
    const isUserNameExist = await Admin.findOne({
      _id: { $ne: id },
      username,
    });

    // if (isUserNameExist) {
    //   return res.status(400).json({
    //     message: "Username already taken. Please enter a unique username.",
    //   });
    // }

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
    const { branch } = req.user;
    if (!branch) {
      const allTeachers = await Teachers.find({}, { password: 0 }).populate({
        path: "myClasses",
      });

      return res.status(200).json(allTeachers);
    }
    const allTeachers = await Teachers.find(
      { branch },
      { password: 0 }
    ).populate({
      path: "myClasses",
    });

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
    const { branch } = req.user;
    const { name, phone, password, userName, dob, courseId, grade } = req.body;

    const studentUser = await Students.findOne({ userName });

    if (studentUser) {
      return res
        .status(409)
        .json({ message: "Student with this username already exist!!!" });
    }

    let classData = null;

    if (courseId) {
      classData = await Classes.findOne({ _id: courseId });
      if (!classData) {
        return res
          .status(404)
          .json({ message: "Class not found or unauthorized." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Students({
      branch: branch,
      userName,
      dob,
      name,
      phone,
      grade,
      password: hashedPassword,
      classes: courseId ? [courseId] : [],
    });

    await newStudent.save();

    await Teachers.updateMany(
      { branch },
      { $addToSet: { myStudents: newStudent._id } }
    );

    if (classData) {
      classData.enrolledStudents.push(newStudent._id);
      await classData.save();
    }

    return res
      .status(200)
      .json({ message: `New student has been registered successfully!!!` });
  } catch (error) {
    console.log("Something went wrong!!! ", error.message);
    res.status(500).json(error);
  }
});

// GET ALL STUDENTS
router.get("/all-students", AdminAuthenticateToken, async (req, res) => {
  try {
    const { branch } = req.user;

    if (!branch) {
      const allStudents = await Students.find({}, { password: 0 });

      return res.status(200).json(allStudents);
    }
    const allStudents = await Students.find({ branch }, { password: 0 });

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
      console.log(feeMonth, paid, amountPaid, "classid", id1, "studentid", id2);
      const fee = await Fee.findOneAndUpdate(
        { classId: id1, studentId: id2 },
        {
          $push: {
            detailFee: {
              feeMonth,
              paid,
              amountPaid,
            },
          },
        },
        { upsert: true, new: true }
      );

      if (fee) {
        const totalFee = fee.detailFee.reduce(
          (sum, fee) => sum + (fee.amountPaid || 0),
          0
        );

        fee.totalFee = totalFee;
        await fee.save();
      }
      console.log("feees", fee);
      res.json(200, {
        message: `Fee for ${feeMonth} is updated successfully.`,
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
  "/monthly-commission/:id1/:id2",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { id1, id2 } = req.params;

      const commissionById = await Commission.find({
        teacherId: id1,
        classId: id2,
      });
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
      const { commission, paid, remarks } = req.body;

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
            remarks: remarks,
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
      await Students.updateMany({ classes: id }, { $pull: { classes: id } });

      // Remove the class ID from teachers' classes
      await Teachers.updateMany({ classes: id }, { $pull: { classes: id } });

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

      res.status(200).json({ message: "Teacher deleted successfully!!!" });
    } catch (error) {
      console.log("Something went wrong!!! ", error);
      res.status(500).json(error.message);
    }
  }
);

router.get(
  "/get-studentsListBySub/:id",

  async (req, res) => {
    const { id } = req.params;
    console.log("id", id);

    try {
      // Fetch the class and populate the enrolledStudents field with user details
      const classDetails = await Classes.findById(id).populate({
        path: "enrolledStudents",
        select: "name phone dob", // Specify fields to include (e.g., 'name', 'email')
      });
      console.log(classDetails);

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

router.get(
  "/download-attendance-report",
  AdminAuthenticateToken,
  async (req, res) => {
    try {
      const { month, year, courseId } = req.query;
      const { branch } = req.user;

      if (!month || !year) {
        return res.status(400).send("Please provide both month and year.");
      }

      let allClasses = [];

      if (courseId) {
        // Fetch a specific class by ID and branch
        const course = await Classes.findOne({
          _id: courseId,
          branch,
        }).populate({
          path: "enrolledStudents",
          populate: {
            path: "attendanceDetail",
            model: "Attendance",
          },
        });

        if (!course) {
          return res.status(404).send("Course not found for this branch.");
        }

        allClasses.push(course); // Wrap in array for uniform processing
      } else {
        // Fetch all classes in branch
        allClasses = await Classes.find({ branch }).populate({
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

      const monthName = new Date(`${year}-${month}-01`).toLocaleString(
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
              const [day, mon, yr] = detail.classDate.split("-").map(Number);
              if (mon === parseInt(month) && yr === parseInt(year)) {
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
