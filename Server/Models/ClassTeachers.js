import mongoose from "mongoose";

const classTeacherSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classes",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  commissionRate: {
    type: Number,
    default: 0,
  },
  offlineCommissionRate: {
    type: Number,
    default: 0,
  },
  onlineCommissionRate: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

classTeacherSchema.index({ classId: 1, teacherId: 1 }, { unique: true });

export default mongoose.model("ClassTeachers", classTeacherSchema);
