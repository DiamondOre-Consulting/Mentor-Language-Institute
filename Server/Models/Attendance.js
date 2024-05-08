import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  totalClassesTaken: {
    type: mongoose.Types.Decimal128,
    default: 0
  },
  detailAttendance: {
    type: [
      {
        classDate: {
            type: String,
            default: Date.now
        },
        numberOfClassesTaken: {
          type: mongoose.Types.Decimal128,
          default: 0
        },
        commission: {
          type: Number,
          default: 0
        } 
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
