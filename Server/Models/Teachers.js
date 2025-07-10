import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
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
  dob: {
    type: Date,
  },
  password: {
    type: String,
    required: true,
  },
  
  jwtStore: {
    type: String,
  },
  myClasses: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classes",
      },
    ],
    default: [],
  },
  myStudents: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Students",
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
