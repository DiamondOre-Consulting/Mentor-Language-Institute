import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  classTitle: {
    type: String,
    required: true,
  },
  // classSchedule: {
  //   type: String,
  //   required: true,
  // },
  teachBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  totalHours: {
    type: Number,
  },
  appliedStudents: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    default: [],
  },
  enrolledStudents: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    default: [],
  },
  dailyClasses: {
    type: [
      {
        type: String,
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Classes", classSchema);
