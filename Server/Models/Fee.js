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
  detailFee: {
    type: [
      {
        feeMonth: {
            type: Date,
            default: Date.now
        },
        paid: {
            type: Boolean,
            default: null
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
