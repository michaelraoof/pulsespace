const express = require("express");
const router = express.Router();
const ConversationModel = require("../models/ConversationModel");
const UserModel = require("../models/UserModel"); // Ensure User model is loaded
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;

    const conversations = await ConversationModel.find({
      users: userId,
    })
      .sort({ "lastMessage.date": -1 })
      .populate("users");

    const chats = conversations.filter(conv => conv.users.length >= 2).map((conv) => {
      // Find the "other" user
      const otherUser = conv.users.find(
        (user) => user._id.toString() !== userId
      );

      if (!otherUser) return null; // Should not happen if filtered, but safety first

      return {
        textsWith: otherUser._id,
        name: otherUser.name,
        profilePicUrl: otherUser.profilePicUrl,
        lastText: conv.lastMessage.text,
        date: conv.lastMessage.date,
      };
    }).filter(chat => chat !== null);

    console.log(`Returning ${chats.length} chats for user ${userId}`);

    return res.json(chats);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

//dummy data chat
// router.post("/", authMiddleware, async (req, res) => {
//   try {
//     const { userId } = req;

//     //initialising models...
//     let dummyData = {
//       user: "61284409d8b2d30a475b7b10",
//       chats: [
//         {
//           textsWith: userId,
//           texts: [
//             {
//               text: "Hiii",
//               sender: userId,
//               receiver: "61284409d8b2d30a475b7b10",
//               date: Date.now(),
//             },
//           ],
//         },
//       ],
//     };
//     await new ChatModel(dummyData).save();

//     return res.status(200).send("Success");
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send("Server Error");
//   }
// });

//set unreadChat to false once the user clicks on chat header icon
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const user = await UserModel.findById(userId);

    if (user.unreadMessage) {
      user.unreadMessage = false;
      await user.save();
    }
    return res.status(200).send("Updated");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
