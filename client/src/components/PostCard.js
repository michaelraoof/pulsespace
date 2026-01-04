import React, { useRef, useState } from "react";
import styled from "styled-components";
import calculateTime from "../utils/calculateTime";
import { ThumbUpIcon } from "@heroicons/react/solid";
import {
  ChatAltIcon,
  MinusCircleIcon,
  ShareIcon,
  ThumbUpIcon as ThumbUpOutlineIcon,
  PencilIcon,
  DotsHorizontalIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { deletePost, likePost, postComment, updatePost } from "utils/postActions";
import CommentComponent from "./CommentComponent";
import { TextareaAutosize } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReusableDialog from "./ReusableDialog";
import toast, { Toaster } from "react-hot-toast";
import { baseUrlFE } from "utils/baseUrl";
import { useClickAway } from "react-use";

const notify = () =>
  toast.success("Post deleted successfully!", {
    position: "bottom-center",
  });

const notifyUpdate = () =>
  toast.success("Post updated successfully!", {
    position: "bottom-center",
  });

const notifyCopyLink = () =>
  toast.success("Post link copied to clipboard!", {
    position: "bottom-center",
  });

function PostCard({ post, user, setPosts, postById }) {
  const router = useNavigate();
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [error, setError] = useState(null);
  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0; //check if post has been liked by logged in user
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(postById ? true : false);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.text);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useClickAway(menuRef, () => {
    setShowMenu(false);
  });

  const createComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    await postComment(post._id, user, commentText, setComments, setCommentText);
    setLoading(false);
  };

  const onEnterPress = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      buttonRef.current.click();
    }
  };

  const handleLike = async () => {
    await likePost(post._id, user._id, setLikes, isLiked ? false : true);
  };

  //Dialog functions
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = async () => {
    await deletePost(post._id, setPosts, notify);

    handleClose();
  };
  const handleDisagree = () => {
    console.log("I do not agree.");
    handleClose();
  };

  const handleUpdate = async () => {
    await updatePost(post._id, editedText, setPosts, notifyUpdate);
    setIsEditing(false);
  };

  return (
    <div
      style={{ fontFamily: "Inter" }}
      className="mb-7 bg-white flex flex-col justify-start rounded-2xl shadow-md"
    >
      <Toaster />
      <div className="p-4">
        <div className="flex space-x-3 items-center ml-2 relative">
          <Image src={post.user.profilePicUrl} alt="userimg" />
          <div>
            <UserPTag
              onClick={() => {
                router(`/${post.user.username}`);
              }}
            >
              {post.user.name}
            </UserPTag>
            <p
              style={{
                fontSize: ".91rem",
              }}
              className="text-gray-500 font-light"
            >
              {calculateTime(post.createdAt)}
            </p>
          </div>

          <ReusableDialog
            title={"Delete Post"}
            action={"delete"}
            item={"post"}
            open={open}
            handleClose={handleClose}
            handleAgree={handleAgree}
            handleDisagree={handleDisagree}
          />
          {post.user._id === user._id && !postById && (
            <div className="absolute right-4 top-2">
              <ThreeDotsDiv
                onClick={() => setShowMenu((prev) => !prev)}
                className="flex justify-center items-center transition duration-200 ease-out hover:bg-gray-100 hover:shadow-sm"
              >
                <DotsHorizontalIcon
                  style={{ height: "1.2rem", width: "1.2rem" }}
                  className="text-gray-500"
                />
              </ThreeDotsDiv>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center space-x-2 transition-colors duration-150"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={() => {
                        handleClickOpen();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2 transition-colors duration-150"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>Delete Post</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="ml-2 mt-5">
            <TextareaAutosize
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              minRows={2}
              className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-hover"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="ml-2 mt-5">{post.text}</p>
        )}
      </div>

      {post.picUrl && <PostImage src={post.picUrl} />}

      <div style={{ marginTop: "0.65rem" }} className="ml-5 mr-5">
        <div className="flex justify-between w-full">
          <div className="flex items-center space-x-0.5 cursor-pointer hover:underline">
            <ThumbUpIcon
              className="h-4 text-gray-400
            "
            />
            <p className="text-md text-gray-500 font-light select-none">
              {likes.length}
            </p>
          </div>
          <p
            onClick={() => setShowComments((prev) => !prev)}
            className="text-gray-500 cursor-pointer hover:underline font-light select-none"
          >{`${comments.length}   comments`}</p>
        </div>
      </div>

      <div
        style={{
          borderTop: ".65px solid lightgrey",
          borderBottom: ".65px solid lightgrey",
          marginTop: ".6rem",
        }}
        className="flex space-x-4 ml-4 mr-4 justify-evenly items-center text-gray-500"
      >
        <div
          onClick={() => handleLike()}
          className="flex flex-grow justify-center hover:bg-gray-100 space-x-2 mb-1 mt-1 pt-2 pb-2 pl-2.5 pr-2.5 rounded-xl cursor-pointer "
        >
          <ThumbUpOutlineIcon
            className={`h-6 ${isLiked ? "text-transparent" : ""}`}
            style={{
              fill: `${isLiked ? "black" : "transparent"}`,
            }}
          />
          <p
            style={{
              userSelect: "none",
              color: `${isLiked ? "black" : "rgba(107, 114, 128)"}`,
            }}
          >
            {/* rgba(124,58,237) */}
            Like
          </p>
        </div>
        <div
          onClick={() => setShowComments((prev) => !prev)}
          className="flex flex-grow justify-center hover:bg-gray-100 space-x-2 mb-1 mt-1 pt-2 pb-2 pl-2.5 pr-2.5 rounded-xl cursor-pointer"
        >
          <ChatAltIcon className="h-6" />
          <p style={{ userSelect: "none" }}>Comment</p>
        </div>
        <div
          onClick={() => {
            navigator.clipboard.writeText(`${baseUrlFE}/post/${post._id}`);

            notifyCopyLink();
          }}
          className="flex flex-grow justify-center hover:bg-gray-100 space-x-2 mb-1 mt-1 pt-2 pb-2 pl-2.5 pr-2.5 rounded-xl cursor-pointer"
        >
          <ShareIcon className="h-6" />
          <p style={{ userSelect: "none" }}>Share</p>
        </div>
      </div>

      {showComments && (
        <div className="pb-4">
          <div className="flex items-center pt-4 pl-5 pr-5 ">
            <form className="w-full">
              {/* div which contains the profilepic and the input div */}
              <div className="flex w-full space-x-2 items-center">
                <Image
                  style={{ height: "2.45rem", width: "2.45rem" }}
                  src={user.profilePicUrl}
                  alt="profile pic"
                />
                <div
                  style={{ padding: ".85rem" }}
                  className={`flex bg-gray-100 rounded-3xl items-center w-full`}
                >
                  <TextareaAutosize
                    style={{ resize: "none", fontFamily: "Inter" }}
                    name="commentText"
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                    }}
                    className="outline-none w-full bg-transparent text-md placeholder-gray-400 font-light"
                    type="text"
                    placeholder={`Write a comment...`}
                    maxRows={"4"}
                    onKeyDown={onEnterPress}
                  ></TextareaAutosize>
                </div>
              </div>
              <button
                hidden
                type="submit"
                onClick={createComment}
                ref={buttonRef}
              ></button>
            </form>
          </div>

          {/* checking if we're on postIdpage. If we're, then rendering all comments, otherwise rendering only 3 */}
          {postById ? (
            <>
              {comments.length > 0 &&
                comments.map((comment) => (
                  <CommentComponent
                    key={comment._id}
                    comment={comment}
                    postId={post._id}
                    user={user}
                    setComments={setComments}
                  />
                ))}
            </>
          ) : (
            <>
              {comments.length > 0 &&
                comments.map(
                  (comment, i) =>
                    i < 3 && (
                      <CommentComponent
                        key={comment._id}
                        comment={comment}
                        postId={post._id}
                        user={user}
                        setComments={setComments}
                      />
                    )
                )}
            </>
          )}

          {!postById && comments.length > 3 && (
            <p
              onClick={() => router(`/post/${post._id}`)}
              className="hover:underline ml-5 mt-3 text-gray-500 cursor-pointer font-normal"
            >
              View all comments
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PostCard;

const Image = styled.img`
  object-fit: cover;
  height: 2.95rem;
  width: 2.95rem;
  border-radius: 50%;
`;

const PostImage = styled.img`
  object-fit: contain;
  height: auto;
  max-height: 455px;
  width: 100%;
  margin-top: 0.35rem;
  margin-bottom: 1.2rem;
  transition: all 0.22s ease-out;
  border-top: 0.7px solid lightgrey;
  border-bottom: 0.7px solid lightgrey;
`;

const UserPTag = styled.p`
  cursor: pointer;
  margin-bottom: -0.09rem;
  font-weight: 500;
  font-size: 1.05rem;
  :hover {
    text-decoration: underline;
  }
`;

const ThreeDotsDiv = styled.div`
  height: 2.2rem;
  width: 2.2rem;
  border-radius: 50%;
  cursor: pointer;
  padding: 0.1rem;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  :hover {
    background-color: #f3f4f6;
    transform: scale(1.05);
  }
`;
