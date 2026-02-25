import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  totalClassesTaken: {
    type: String,
    default: "0",
  },

  detailAttendance: {
    type: [
      {
        classDate: {
          type: String,
          default: "",
        },
        numberOfClassesTaken: {
          type: String,
          default: "0",
        },
        teacherId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
        mode: {
          type: String,
          enum: ["online", "offline"],
          default: "offline",
        },
        grade: {
          type: String,
          // required: true,
          default: "Invalid",
        },

        commission: {
          type: Number,
          default: 0,
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

export default mongoose.model("Attendance", attendanceSchema);
