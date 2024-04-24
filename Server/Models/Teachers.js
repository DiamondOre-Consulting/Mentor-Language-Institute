import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
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
      },
    ],
    default: [],
  },
  myStudents: {
    type: [
        {
          type: mongoose.Schema.Types.ObjectId,
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
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }], // Reference to chat documents
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Teacher", teacherSchema);
