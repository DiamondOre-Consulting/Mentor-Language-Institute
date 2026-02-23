import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  branch: {
    type: String,
    default: "Main",
  },
  classTitle: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    default: "",
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
        ref: "Student",
      },
    ],
    default: [],
  },
  dailyClasses: {
    type: [
      {
        classDate: {
          type: String,
        },
        numberOfClasses: {
          type: String,
        },
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
