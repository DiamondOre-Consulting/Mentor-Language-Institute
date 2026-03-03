import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
  },
  phone: {
    type: String,
    required: true,
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
  parents: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    default: [],
  },
  teachers: {
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

export default mongoose.model("Admin", adminSchema);
