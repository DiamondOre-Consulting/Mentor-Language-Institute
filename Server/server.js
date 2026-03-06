import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import feeReminderScheduler from "./feeReminderScheduler.js";
import scheduleCleanup from "./scheduleCleanup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const allowedOrigins = (process.env.CLIENT_ORIGINS ||
  "http://localhost:5173,https://www.mentorlanguageinstitute.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
const server = createServer(app);

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
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error(
    "Missing MongoDB connection string. Set MONGO_URI (or MONGODB_URI) in .env."
  );
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

import AdminController from "./Controllers/admin.js";
import StudentController from "./Controllers/student.js";
import TeacherController from "./Controllers/teacher.js";
import AuthController from "./Controllers/auth.js";

app.use("/api/admin-confi", AdminController);
app.use("/api/students", StudentController);
app.use("/api/teachers", TeacherController);
app.use("/api/auth", AuthController);

feeReminderScheduler();
scheduleCleanup();

app.get("/", (req, res) => {
  res.send("Hello Mentor Language Institute");
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
