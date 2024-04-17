import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Student", studentSchema);
