const ConversationModel = require("../models/ConversationModel");
const MessageModel = require("../models/MessageModel");
const UserModel = require("../models/UserModel");
const mongoose = require("mongoose");

const loadTexts = async (userId, textsWith, page = 0) => {
  try {
    // Explicitly cast IDs to ensure matching
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const partnerObjectId = new mongoose.Types.ObjectId(textsWith);

    console.log("Loading texts for:", userId, "with", textsWith);

    // Find Conversation between the two users
    let conversation = await ConversationModel.findOne({
      users: { $all: [userObjectId, partnerObjectId] },
    });

    console.log("Found Conversation:", conversation ? conversation._id : "None");

    if (!conversation) {
      // No conversation exists yet
      const textsWithUser = await UserModel.findById(textsWith);
      const textsWithDetails = {
        name: textsWithUser.name,
        profilePicUrl: textsWithUser.profilePicUrl,
        id: textsWithUser._id,
      };
      return { textsWithDetails };
    }

    // Fetch Messages
    // We want the LATEST messages (Date Descending), offset by page.
    const messages = await MessageModel.find({
      conversationId: conversation._id,
    })
      .sort({ date: -1 })
      .skip(page * 10)
      .limit(11); // Fetch 11 to check if hasMore

    const hasMore = messages.length > 10;
    const texts = messages.slice(0, 10).reverse(); // Reverse to get chronological order (Old -> New)

    const talkingTo = await UserModel.findById(textsWith);

    // Construct response to match previous shape expected by frontend "chat" object
    const chatData = {
      textsWith: talkingTo,
      texts: texts,
    };

    return { chat: chatData, hasMore };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getUserInfo = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      const userDetails = {
        name: user.name,
        profilePicUrl: user.profilePicUrl,
        id: user._id,
      };
      return {
        userDetails,
      };
    }
    return;
  } catch (error) {
    console.log(error);
  }
};

const sendText = async (userId, userToTextId, text) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const partnerObjectId = new mongoose.Types.ObjectId(userToTextId);

    // Find or Create Conversation
    let conversation = await ConversationModel.findOne({
      users: { $all: [userObjectId, partnerObjectId] }
    });

    if (!conversation) {
      conversation = await new ConversationModel({
        users: [userObjectId, partnerObjectId],
        lastMessage: {
          text,
          sender: userId,
          date: Date.now()
        }
      }).save();
    } else {
      conversation.lastMessage = {
        text,
        sender: userId,
        date: Date.now()
      };
      await conversation.save();
    }

    const newMessage = await new MessageModel({
      conversationId: conversation._id,
      sender: userId,
      receiver: userToTextId,
      text,
      date: Date.now()
    }).save();

    return { newText: newMessage };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const setMessageToUnread = async (userId) => {
  try {
    const user = await UserModel.findById(userId);

    if (!user.unreadMessage) {
      user.unreadMessage = true;
      await user.save();
    }

    return;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { loadTexts, sendText, setMessageToUnread, getUserInfo };
