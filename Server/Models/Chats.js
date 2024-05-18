import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
   name: {
    type: String,
    required: true
   },
   creator: {
    type: mongoose.Schema.Types.ObjectId
   },
   
})