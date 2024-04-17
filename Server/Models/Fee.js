import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  totalFee: {
    type: Number,
    required: true
  },
  detailFee: {
    type: [
      {
        feeMonth: {
            type: String,
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
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Fee", feeSchema);
