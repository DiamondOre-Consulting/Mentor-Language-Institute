import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Classes",
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Student",
  },
  totalFee: {
    type: Number,
    required: true,
    min: 0,
  },
  detailFee: {
    type: [
      {
        feeMonth: {
          type: Number,
        },
        feeYear: {
          type: Number,
        },
        paid: {
          type: Boolean,
          default: null
        },
        amountPaid: {
          type: Number,
        }
      },
    ],
    default: [],
    validate: {
      validator: (items) => {
        const keys = (items || []).map((entry) => {
          const month = Number(entry?.feeMonth);
          const year = Number(entry?.feeYear);
          const safeMonth = Number.isFinite(month) ? month : "na";
          const safeYear = Number.isFinite(year) ? year : "na";
          return `${safeMonth}-${safeYear}`;
        });
        return new Set(keys).size === keys.length;
      },
      message: "Fee month entries must be unique per course and year.",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Fee", feeSchema);
