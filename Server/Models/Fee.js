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
    // required: true
  },
  detailFee: {
    type: [
      {
        feeMonth: {
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
        const months = (items || []).map((entry) => Number(entry?.feeMonth)).filter(Number.isFinite);
        return new Set(months).size === months.length;
      },
      message: "Fee month entries must be unique per course.",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Fee", feeSchema);
