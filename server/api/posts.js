const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const PostModel = require("../models/PostModel");
const UserModel = require("../models/UserModel");
const FollowerModel = require("../models/FollowerModel");
const router = express.Router();
const uuid = require("uuid").v4;
const {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
} = require("../utils/notificationActions");

//CREATE A POST

router.post("/", authMiddleware, async (req, res) => {
  const { text, location, picUrl } = req.body;

  if (text.length < 1)
    return res.status(401).send("Text must be atleast 1 character");

  try {
    const newPost = {
      user: req.userId,
      text,
    };

    if (location) newPost.location = location;
    if (picUrl) newPost.picUrl = picUrl;

    const post = await new PostModel(newPost).save();

    const postCreated = await PostModel.findById(post._id).populate("user");

    return res.json(postCreated); //returning post now just for testing
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

// GET ALL POSTS
router.get("/", authMiddleware, async (req, res) => {
  const { pageNumber } = req.query; //from params in axios call in fetchDataOnScroll in index.js

  const number = Number(pageNumber); //to convert pageNumber to number from string
  const size = 8; //number of posts to be sent on each page

  try {
    const { userId } = req;
    const loggedUser = await FollowerModel.findOne({ user: userId });
    let posts = [];

    if (number === 1) {
      if (loggedUser.following.length > 0) {
        posts = await PostModel.find({
          user: {
            $in: [
              userId,
              ...loggedUser.following.map((following) => following.user),
            ],
          },
        })
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }

      //IF user is not following anyone
      else {
        posts = await PostModel.find({ user: userId })
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }
    } else {
      const skips = size * (number - 1);
      if (loggedUser.following.length > 0) {
        posts = await PostModel.find({
          user: {
            $in: [
              userId,
              ...loggedUser.following.map((following) => following.user),
            ],
          },
        })
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }
      //IF user is not following anyone
      else {
        posts = await PostModel.find({ user: userId })
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }
    }
    return res.json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

//GET POST BY ID
router.get("/:postId", authMiddleware, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId)
      .populate("user")
      .populate("comments.user");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

//DELETE POST by ID
router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { postId } = req.params;
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    const user = await UserModel.findById(userId);

    //if some user other than logged in user tries to delete a post
    if (post.user._id.toString() !== userId) {
      if (user.role === "root") {
        await post.deleteOne();
        return res.status(200).send("Post deleted successfully");
      } else {
        return res.status(401).send("Unauthorized");
      }
    }

    await post.deleteOne();
    return res.status(200).send("Post deleted successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

//LIKE A POST by ID
router.post("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req; //from authMiddleware
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("No Post found");
    }

    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length > 0;

    if (isLiked) {
      return res.status(401).send("Post already liked");
    }

    await post.likes.unshift({ user: userId });
    await post.save();

    if (post.user.toString() !== userId) {
      await newLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send("Post liked");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

//UPDATE POST by ID
router.put("/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || text.length < 1) {
      return res.status(400).send("Text is required");
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    const user = await UserModel.findById(userId);

    //if some user other than logged in user tries to update a post
    if (post.user.toString() !== userId) {
      if (user.role === "root") {
      } else {
        return res.status(401).send("Unauthorized");
      }
    }


    if (post.user.toString() !== userId && user.role !== "root") {
      return res.status(401).send("Unauthorized");
    }

    post.text = text;
    await post.save();

    return res.status(200).send("Post updated successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

//UNLIKE A POST by ID
router.put("/unlike/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req; //from authMiddleware
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("No Post found");
    }

    const isLikedIndex = post.likes.findIndex(
      (like) => like.user.toString() === userId
    );

    if (isLikedIndex === -1) {
      return res.status(400).send("Can't unlike a post that hasn't been liked");
    } else {
      await post.likes.splice(isLikedIndex, 1);

      await post.save();

      await post.save();
      //otherwise SEND NOTIFICATION
      if (post.user.toString() !== userId) {
        await removeLikeNotification(userId, postId, post.user.toString());
      }
      return res.status(200).send("Post unliked");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

//GET ALL LIKES FOR A POST
router.get("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId).populate("likes.user");
    if (!post) {
      return res.status(404).send("No Post found");
    }

    return res.status(200).json(post.likes);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

//CREATE A COMMENT

router.post("/comment/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const { userId } = req;

    if (text.length < 1)
      return res.status(401).send("Comment should be atleast 1 character");

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("No Post found");
    }

    const newComment = {
      _id: uuid(),
      text,
      user: req.userId,
      date: Date.now(),
    };

    await post.comments.unshift(newComment);
    await post.save();

    if (post.user.toString() !== userId) {
      await newCommentNotification(
        postId,
        newComment._id,
        userId,
        post.user.toString(),
        text
      );
    }
    return res.status(200).json(newComment._id);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

//DELETE COMMENT

router.delete("/:postId/:commentId", authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("No Post found");
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).send("Comment not found");
    }

    const user = await UserModel.findById(userId);

    const comment = post.comments[commentIndex];
    if (comment.user.toString() !== userId) {
      if (user.role === "root") {
        await post.comments.splice(commentIndex, 1);
        await post.save();
        return res.status(200).send("Comment deleted successfully");
      } else {
        return res.status(401).send("Unauthorized");
      }
    }

    await post.comments.splice(commentIndex, 1);
    await post.save();

    if (post.user.toString() !== userId) {
      await removeCommentNotification(
        postId,
        commentId,
        userId,
        post.user.toString()
      );
    }

    return res.status(200).send("Comment deleted successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
