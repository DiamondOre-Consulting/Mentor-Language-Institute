import express, { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../Models/Admin.js";
import AdminAuthenticateToken from "../Middlewares/AdminAuthenticateToken.js";
import Classes from "../Models/Classes.js";
import Teachers from "../Models/Teachers.js";

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
      username: name + " - " + phone,
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
        totalHours
    })

    await newClass.save();

    return res.status(200).json({message: "new class has added!!!", newClass});
  } catch (error) {
    console.log("Something went wrong!!! ");
    res.status(500).json(error);
  }
});

// GET ALL CLASSES
router.get('/all-classes', AdminAuthenticateToken, async (req, res) => {
    try {
        const allClasses = await Classes.find({});

        return res.status(200).json(allClasses);
    } catch(error) {
        console.log("Something went wrong!!! ");
        res.status(500).json(error); 
    }
})

// GET CLASS BY ID
router.get('/all-classes/:id', AdminAuthenticateToken, async (req, res) => {
    try {
        const {id} = req.params;

        const singleClass = await Classes.findById({_id: id});

        return res.status(200).json(singleClass);

    } catch(error) {
        console.log("Something went wrong!!! ");
        res.status(500).json(error); 
    }
})

// ADD TEACHER
router.post('/add-teacher', AdminAuthenticateToken, async (req, res) => {
    try {
        const { name, username, phone } = req.body;

        if (name && username && phone) {
            const newTeacher = new Teachers({
                name,
                username: name + "-" + phone,
                phone
            })

            await newTeacher.save();
        }
        return res.status(200).json({message: "new teaher has added!!!", newTeacher});
    } catch(error) {
        console.log("Something went wrong!!! ");
        res.status(500).json(error);
    }
})

export default router;
