import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  branch: {
    type: String,
    default: "Main",
  },
  role: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim:true
  },
  phone: {
    type: String,
    required: true,
    trim:true,
    unique:true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
  },
  dob: {
    type: Date,
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
  
  jwtStore: {
    type: String,
  },
  myStudents: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    default: [],
  },
  myScheduledClasses: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    default: [],
  },
  chats: [mongoose.Schema.Types.ObjectId], // Reference to chat documents
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Teacher", teacherSchema);
