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
import { verifyAccessToken } from "./utils/authTokens.js";

dotenv.config();

const allowedOrigins = (process.env.CLIENT_ORIGINS ||
  "http://localhost:5173,https://www.mentorlanguageinstitute.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
const server = createServer(app);
// const io = new Server(server);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("trust proxy", 1);
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT|| 7000;
app.use(morgan("dev"));

io.use((socket, next) => {
  const authToken =
    socket.handshake?.auth?.token ||
    socket.handshake?.headers?.authorization?.split(" ")[1];

  if (!authToken) {
    return next(new Error("Unauthorized"));
  }

  try {
    const { payload, role } = verifyAccessToken(authToken);
    socket.data.user = {
      ...payload,
      role: payload?.role || role,
      userId: payload?.userId || payload?.sub,
    };
    return next();
  } catch (error) {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data?.user;
  if (!user?.userId || !user?.role) {
    socket.disconnect(true);
    return;
  }

  const selfRoom = `${user.role}-${user.userId}`;
  socket.join(selfRoom);

  socket.on("send-message", async ({ receiverId, receiverRole, message }) => {
    try {
      if (!receiverId || !receiverRole) {
        return;
      }
      if (!["student", "teacher"].includes(receiverRole)) {
        return;
      }
      if (!message || !String(message).trim()) {
        return;
      }

      const senderId = user.userId;
      const sanitizedMessage = String(message).trim();

      // Save the message to your database (Messages collection)
      const newMessage = new Messages({
        senderId,
        receiverId,
        message: sanitizedMessage,
      });
      await newMessage.save();

      const payload = {
        senderId,
        receiverId,
        message: sanitizedMessage,
        createdAt: newMessage.createdAt,
        _id: newMessage._id,
      };

      io.to(`${receiverRole}-${receiverId}`).emit("receive-message", payload);
      io.to(selfRoom).emit("receive-message", payload);
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
import AuthController from "./Controllers/auth.js";
import Students from "./Models/Students.js";
import Classes from "./Models/Classes.js";

app.use("/api/admin-confi", AdminController);
app.use("/api/students", StudentController);
app.use("/api/teachers", TeacherController);
app.use("/api/chats", ChatController);
app.use("/api/auth", AuthController);

feeReminderScheduler();

app.get("/", (req, res) => {
  res.send("Hello Mentor Language Institute");
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
