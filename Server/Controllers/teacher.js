import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Teachers from "../Models/Teachers.js";

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



export default router;
