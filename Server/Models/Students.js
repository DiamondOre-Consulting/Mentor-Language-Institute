import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  branch: {
    type: String,
    default: "Main",
  },
  name: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
  },
  grade: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
  },
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordTokenHash: {
    type: String,
    default: "",
  },
  resetPasswordExpiresAt: {
    type: Date,
  },
  appliedClasses: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    default: [],
  },
  classes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classes",
      },
    ],
    default: [],
  },
  attendanceDetail: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
      },
    ],
  },
  feeDetail: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fee",
      },
    ],
  },
  chats: [mongoose.Schema.Types.ObjectId], // Reference to chat documents
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  deactivated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Student", studentSchema);
