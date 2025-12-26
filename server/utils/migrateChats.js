const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" }); // Assumes running from server root

const ChatModel = require("../models/ChatModel");
const ConversationModel = require("../models/ConversationModel");
const MessageModel = require("../models/MessageModel");
const connectDb = require("../utilsServer/connectDb");

const migrateChats = async () => {
    try {
        await connectDb();
        console.log("Starting migration...");

        const allChats = await ChatModel.find();
        console.log(`Found ${allChats.length} user chat documents.`);

        const processedPairs = new Set();
        let convCount = 0;
        let msgCount = 0;

        for (const userChat of allChats) {
            const userId = userChat.user.toString();

            for (const chat of userChat.chats) {
                const partnerId = chat.textsWith.toString();

                // Create a unique key for the pair (smallerID_largerID) to avoid duplicates
                const pairKey = [userId, partnerId].sort().join("_");

                if (processedPairs.has(pairKey)) {
                    console.log(`Skipping duplicate pair: ${pairKey}`);
                    continue;
                }

                console.log(`Processing conversion for pair: ${pairKey}`);

                // Create Conversation
                const conversation = await new ConversationModel({
                    users: [userId, partnerId],
                    lastMessage: {
                        text: chat.texts.length > 0 ? chat.texts[chat.texts.length - 1].text : "",
                        sender: chat.texts.length > 0 ? chat.texts[chat.texts.length - 1].sender : null,
                        date: chat.texts.length > 0 ? chat.texts[chat.texts.length - 1].date : Date.now()
                    }
                }).save();

                convCount++;

                // Process Messages
                const messageDocs = chat.texts.map(msg => ({
                    conversationId: conversation._id,
                    sender: msg.sender,
                    receiver: msg.receiver,
                    text: msg.text,
                    date: msg.date
                }));

                if (messageDocs.length > 0) {
                    await MessageModel.insertMany(messageDocs);
                    msgCount += messageDocs.length;
                }

                processedPairs.add(pairKey);
            }
        }

        console.log("Migration Complete!");
        console.log(`Created ${convCount} conversations and ${msgCount} messages.`);
        process.exit(0);

    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};

migrateChats();
