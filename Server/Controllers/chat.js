import express from "express";
import dotenv from "dotenv";
import StudentAuthenticateToken from "../Middlewares/StudentAuthenticateToken.js";
import TeacherAuthenticateToken from "../Middlewares/TeacherAuthenticateToken.js";
import AdminAuthenticateToken from "../Middlewares/AdminAuthenticateToken.js"
import Messages from "../Models/Messages.js";

const router = express.Router();

router.post('/send-message', (TeacherAuthenticateToken || StudentAuthenticateToken || AdminAuthenticateToken), async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;
        
        const newMessage = new Messages({
            senderId,
            receiverId,
            message
        });

        await newMessage.save();
        
        res.status(201).json({ message: 'Message sent successfully', data: newMessage });
    } catch(error) {
        console.log("Something went wrong!!! ", error);
        res.status(500).json(error);
    }
})

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

export default router;