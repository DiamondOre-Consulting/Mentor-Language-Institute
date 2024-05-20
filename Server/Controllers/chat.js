import express from "express";
import dotenv from "dotenv";
import StudentAuthenticateToken from "../Middlewares/StudentAuthenticateToken.js";
import TeacherAuthenticateToken from "../Middlewares/TeacherAuthenticateToken.js";
import AdminAuthenticateToken from "../Middlewares/AdminAuthenticateToken.js"
import Messages from "../Models/Messages.js";

const router = express.Router();

router.get('/get-messages-student/:id', StudentAuthenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        
        // Filter messages based on senderId and receiverId
        const messages = await Messages.find({ 
          $or: [
            { senderId: userId, receiverId: id },
            { senderId: id, receiverId: userId },
          ]
        }).sort({ createdAt: 1 });
    
        res.status(200).json({ messages });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
})

router.get('/get-messages-teacher/:id', TeacherAuthenticateToken, async (req, res) => {
  try {
      const { id } = req.params;
      const { userId } = req.user;
      
      // Filter messages based on senderId and receiverId
      const messages = await Messages.find({ 
        $or: [
          { senderId: userId, receiverId: id },
          { senderId: id, receiverId: userId },
        ]
      }).sort({ createdAt: 1 });
  
      res.status(200).json({ messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/get-messages-admin/:id1/:id2', AdminAuthenticateToken, async (req, res) => {
  try {
      const { id1, id2 } = req.params;
      
      // Filter messages based on senderId and receiverId
      const messages = await Messages.find({ 
        $or: [
          { senderId: id1, receiverId: id2 },
          { senderId: id2, receiverId: id1 },
        ]
      }).sort({ createdAt: 1 });
  
      res.status(200).json({ messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
})

export default router;