import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    monthName: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    classesTaken: {
        type: mongoose.Types.Decimal128,
        default: 0
    },
    commission: {
        type: Number,
        default: 0
    },
    paid: {
        type: Boolean,
        default: null
    },
    remarks: {
        type: String,
    }
});

export default mongoose.model('Commission', commissionSchema);