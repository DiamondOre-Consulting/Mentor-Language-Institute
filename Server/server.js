import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {createServer} from "http";
// import socket from 'socket.io';
import { Server } from 'socket.io';
import feeReminderScheduler from "./feeReminderScheduler.js";

const app = express();
const server = createServer(app);
// const io = new Server(server);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ['GET','POST'],
    credentials: true
  }
});
dotenv.config();

app.use(express.json());
app.use(cors());

const PORT = 7000;

// // Socket.IO event handlers
// io.on('connection', (socket) => {
//   console.log('A user connected');
  
//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });

//   socket.on('send_message', (data) => {
//     // Broadcast the message to all connected clients
//     io.emit('receive_message', data);
//   });
// });

// const io = socket(server,{
//   cors :{
//     origin : '*',
//     credentials : true
//   }
// })

// global.onlineUsers = new Map();

// Socket.io setup
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // Handle real-time events here
//   // Example: socket.on('chat message', (message) => { ... });
//   socket.on('sendMessage', (message) => {
//     io.emit('message', message);
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('New client connected');
  console.log("Id: ", socket.id);

  socket.on('message', ( {room, message}) => {
    console.log({room, message});
    io.to(room).emit('received', message)
  })
  
  socket.on('disconnect', () => {
    console.log("User disconnected", socket.id);
  })
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

import AdminController from "./Controllers/admin.js"
import StudentController from "./Controllers/student.js";
import TeacherController from "./Controllers/teacher.js";
import Students from "./Models/Students.js";
import Classes from "./Models/Classes.js";

app.use('/api/admin-confi', AdminController);
app.use('/api/students', StudentController);
app.use('/api/teachers', TeacherController);

feeReminderScheduler();

app.get('/', (req, res) => {
    res.send("Hello Mentor Language Institute")
})


server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
