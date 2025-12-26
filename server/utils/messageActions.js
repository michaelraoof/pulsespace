const ChatModel = require("../models/ChatModel");
const UserModel = require("../models/UserModel");
const mongoose = require("mongoose");

const loadTexts = async (userId, textsWith, page = 0) => {
  try {
    const user = await ChatModel.findOne({ user: userId });

    const chat = user.chats.find(
      (chat) => chat.textsWith.toString() === textsWith
    );

    if (!chat) {
      const textsWithUser = await UserModel.findById(textsWith);
      const textsWithDetails = {
        name: textsWithUser.name,
        profilePicUrl: textsWithUser.profilePicUrl,
        id: textsWithUser._id,
      };
      return { textsWithDetails };
    }

    const aggregatedChat = await ChatModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          chat: {
            $filter: {
              input: "$chats",
              as: "chat",
              cond: {
                $eq: ["$$chat.textsWith", new mongoose.Types.ObjectId(textsWith)],
              },
            },
          },
        },
      },
      { $unwind: "$chat" },
      {
        $project: {
          textsWith: "$chat.textsWith",
          texts: {
            $slice: ["$chat.texts", -((page + 1) * 10), 10],
          },
        },
      },
    ]);

    const chatData = aggregatedChat[0];

    const talkingTo = await UserModel.findById(chatData.textsWith);

    chatData.textsWith = talkingTo;

    return { chat: chatData };
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
    const loggedInUser = await ChatModel.findOne({ user: userId });

    const textToSendUser = await ChatModel.findOne({ user: userToTextId });

    const newText = {
      sender: userId,
      receiver: userToTextId,
      text,
      date: Date.now(),
    };

    //--SENDER--
    const previousChat =
      loggedInUser.chats.length > 0 &&
      loggedInUser.chats.find(
        (chat) => chat.textsWith.toString() === userToTextId
      );

    if (previousChat) {
      previousChat.texts.push(newText);
    } else {
      const newChat = {
        textsWith: userToTextId,
        texts: [newText],
      };

      loggedInUser.chats.unshift(newChat);
    }
    await loggedInUser.save();
    //--RECEIVER
    const lastChat =
      textToSendUser.chats.length > 0 &&
      textToSendUser.chats.find((chat) => chat.textsWith.toString() === userId);
    if (lastChat) {
      lastChat.texts.push(newText);
    } else {
      const newChat = {
        textsWith: userId,
        texts: [newText],
      };

      textToSendUser.chats.unshift(newChat);
    }
    await textToSendUser.save();
    return { newText };
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
