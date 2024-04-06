import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attendance"
  },
  feeDetail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fee"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Student", studentSchema);
