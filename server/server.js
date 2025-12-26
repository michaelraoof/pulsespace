const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").Server(app);
require("dotenv").config({ path: "./config.env" });
const dev = process.env.NODE_ENV !== "production";
const baseUrlFE = process.env.FE_URL;
const connectDb = require("./utilsServer/connectDb");
const PORT = process.env.PORT || 3000;
const corsOpts = {
  origin: baseUrlFE,
  credentials: true,
};
const io = require("socket.io")(server, {
  cors: {
    ...corsOpts,
  },
});
const {
  addUser,
  removeUser,
  findConnectedUser,
} = require("./utils/roomActions");
const {
  loadTexts,
  sendText,
  setMessageToUnread,
  getUserInfo,
} = require("./utils/messageActions");

connectDb();

app.use(cors(corsOpts));
app.use(express.json());

io.on("connection", (socket) => {
  //socket is basically the client who's connected to this
  //socket.on is used to listen to the event and receive the data on the server or the client
  //socket.emit is used to send the data from the server or from the client
  socket.on("join", async ({ userId }) => {
    //socket.id is a unique id for this socket. It's regenerated at every connection.
    //This is also the name of the room that the socket auto joins on connection
    const users = await addUser(userId, socket.id);

    setInterval(() => {
      //sending back all the users to the client(who's made this connection) without the logged in user
      // console.log(users);
      socket.emit("connectedUsers", {
        users: users.filter((user) => user.userId !== userId),
      });
    }, 10000);
  });

  socket.on("loadTexts", async ({ userId, textsWith, page }) => {
    const { chat, error, textsWithDetails } = await loadTexts(
      userId,
      textsWith,
      page
    );
    //loadMessages will either return error or chat
    if (!error) {
      socket.emit("textsLoaded", { chat, textsWithDetails });
    }
  });

  socket.on("sendNewText", async ({ userId, userToTextId, text }) => {
    const { newText, error } = await sendText(userId, userToTextId, text);
    const { userDetails } = await getUserInfo(newText.sender);
    const receiverSocket = findConnectedUser(userToTextId); //to find connected user for receiving texts

    //if check to see if that user is still online
    if (receiverSocket) {
      //io.to is used to send/emit an event to only a specific socket (or a user in this case). We don't want to send this message to all connected users
      io.to(receiverSocket.socketId).emit("newTextReceived", {
        newText,
        userDetails,
      });
    } else {
      await setMessageToUnread(userToTextId); //notify this user in case he's offline by setting unreadMessage to true in UserModel
    }

    if (!error) {
      socket.emit("textSent", { newText }); //this is for sender and updating state on sender's side
    }
  });
  // DISCONNECT is a reserved keyword in socket v4.0.1, so cleanup is done automatically by socket when user disconnects. NO NEED TO LISTEN TO 'disconnect' event
  socket.on("disconnect", () => {
    removeUser(socket.id); //removes the connectected client, as socket is basically the client
  });
});

app.use("/api/signup", require("./api/signup"));
app.use("/api/auth", require("./api/auth"));
app.use("/api/posts", require("./api/posts"));
app.use("/api/notifications", require("./api/notifications"));
app.use("/api/profile", require("./api/profile"));
app.use("/api/search", require("./api/search"));
app.use("/api/chats", require("./api/chats"));

app.use("/", (req, res) => res.status(200).json({ message: "Welcome to PulseSpace" }))
app.all("*", (req, res) => res.status(404).json({ error: "Not Found" }));

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Express server running on ${PORT}`);
});

//we're calling app.all because all pages in next.js are SSR(Server Side Rendered)
//if we don't type app.all, the files inside the pages folder won't work
