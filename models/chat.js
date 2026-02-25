import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
    },

    content: {
        type: String,
        required: true,
    },

    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    messages: [messageSchema],
});

export default mongoose.model("chat", chatSchema);

