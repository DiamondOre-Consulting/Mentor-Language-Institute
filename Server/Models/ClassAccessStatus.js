import mongoose from "mongoose";

const classAccessStatusSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    classAccessStatus: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('classAccessStatus', classAccessStatusSchema)