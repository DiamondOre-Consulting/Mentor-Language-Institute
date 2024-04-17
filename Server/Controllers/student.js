import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Students from "../Models/Students";
import StudentAuthenticateToken from "../Middlewares/StudentAuthenticateToken";

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

router.get('all-courses', StudentAuthenticateToken, async (req, res) => {
    
})

export default router;
