import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import { createServer } from "http";
// import socket from 'socket.io';
import { Server } from "socket.io";
import feeReminderScheduler from "./feeReminderScheduler.js";
import Messages from "./Models/Messages.js";
import Student from "./Models/Students.js";

const app = express();
const server = createServer(app);
// const io = new Server(server);
const io = new Server(server, {
  cors: {
    origin: ["https://www.mentorlanguageinstitute.com", "*" , "http://locahost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// https://www.mentorlanguageinstitute.com
dotenv.config();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT|| 7000;
app.use(morgan("dev"));

// Socket.IO logic
// io.on('connection', (socket) => {
//   console.log('New client connected');
//   console.log("Id: ", socket.id);

//   socket.on('message', ( {room, message}) => {
//     console.log({room, message});
//     io.to(room).emit('received', message)
//   })

//   socket.on('disconnect', () => {
//     console.log("User disconnected", socket.id);
//   })
// });

io.on("connection", (socket) => {
  console.log("A user connected ", socket.id);

  // Handle student login
  socket.on("student-login", (studentId) => {
    socket.join(`student-${studentId}`);
  });

  // Handle teacher login
  socket.on("teacher-login", (teacherId) => {
    socket.join(`teacher-${teacherId}`);
  });

  // Handle incoming messages
  socket.on("send-message", async ({ senderId, receiverId, message }) => {
    try {
      console.log(senderId, receiverId, message);
      // Save the message to your database (Messages collection)
      const newMessage = new Messages({
        senderId,
        receiverId,
        message,
      });
      await newMessage.save();

      // Emit the message to the appropriate room (e.g., teacher's room)
      io.to(`teacher-${receiverId}`).emit("receive-message", {
        senderId,
        message,
      });
      io.to(`student-${receiverId}`).emit("receive-message", {
        senderId,
        message,
      });
    } catch (error) {
      console.error("Error saving message:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

import AdminController from "./Controllers/admin.js";
import StudentController from "./Controllers/student.js";
import TeacherController from "./Controllers/teacher.js";
import ChatController from "./Controllers/chat.js";
import Students from "./Models/Students.js";
import Classes from "./Models/Classes.js";

app.use("/api/admin-confi", AdminController);
app.use("/api/students", StudentController);
app.use("/api/teachers", TeacherController);
app.use("/api/chats", ChatController);

feeReminderScheduler();

app.get("/", (req, res) => {
  res.send("Hello Mentor Language Institute");
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
