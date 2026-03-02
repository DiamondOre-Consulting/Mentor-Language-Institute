import mongoose from "mongoose";

const paymentRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classes",
    required: true,
  },
  paymentMethod: {
    type: String,
    trim: true,
    default: "",
  },
  transactionId: {
    type: String,
    trim: true,
    default: "",
  },
  amount: {
    type: Number,
    min: 0,
    default: 0,
  },
  paidOn: {
    type: Date,
    default: null,
  },
  payerName: {
    type: String,
    trim: true,
    default: "",
  },
  phone: {
    type: String,
    trim: true,
    default: "",
  },
  notes: {
    type: String,
    default: "",
    trim: true,
  },
  screenshotUrl: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  decisionAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    default: "",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

paymentRequestSchema.index({ classId: 1, studentId: 1, status: 1 });

export default mongoose.model("PaymentRequest", paymentRequestSchema);
