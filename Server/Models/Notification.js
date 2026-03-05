import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    feeMonth: {
      type: Number,
      default: null,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, classId: 1, feeMonth: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
