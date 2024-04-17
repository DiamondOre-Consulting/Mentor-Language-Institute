import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import TeacherAuthenticateToken from "../Middlewares/TeacherAuthenticateToken";

// LOGIN AS TEACHER
router.post('/login-teacher', TeacherAuthenticateToken, async (req, res) => {
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
    } catch(error) {
        console.log("Something went wrong!!! ");
        res.status(500).json(error);
    }
})