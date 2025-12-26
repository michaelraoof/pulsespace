const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
    {
        users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
        lastMessage: {
            text: { type: String },
            sender: { type: Schema.Types.ObjectId, ref: "User" },
            date: { type: Date },
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: {} // Key: UserId, Value: count
        }
    },
    { timestamps: true }
);

ConversationSchema.index({ users: 1 });

module.exports = mongoose.model("Conversation", ConversationSchema);
