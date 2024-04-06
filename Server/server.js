import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());

const PORT = 7000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.get("/", (req, res) => {
  res.send("Hello Mentor Language Institute!!!");
});

import AdminController from "./Controllers/admin.js"

app.use('/api/admin-confi', AdminController);

app.get('/', (req, res) => {
    res.send("Hello Mentor Language Institute")
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
