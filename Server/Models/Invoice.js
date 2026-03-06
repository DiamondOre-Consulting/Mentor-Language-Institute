import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classes",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fee",
    },
    feeMonth: {
      type: Number,
      required: true,
    },
    feeYear: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    totalFee: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["paid"],
      default: "paid",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    sentToEmail: {
      type: String,
      default: "",
    },
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    emailError: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
