const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

MessageSchema.index({ conversationId: 1, date: -1 });

module.exports = mongoose.model("Message", MessageSchema);
