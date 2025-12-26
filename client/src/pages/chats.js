import axios from "axios";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from "components/Header";
import baseUrl from "utils/baseUrl";
import io from "socket.io-client"; //socket.io import
import Sidebar from "components/Sidebar";
import ChatSearch from "components/Chat/ChatSearch";
import { SearchIcon, ArrowLeftIcon, ChatIcon as ChatIconOutline, PaperAirplaneIcon } from "@heroicons/react/outline";
import styled from "styled-components";
import calculateTime from "utils/calculateTime";
import Chat from "components/Chat/Chat";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import cookie from "js-cookie";
import { Facebook } from "react-content-loader";
import useBearStore from "store/store";
import Loader from "react-loader-spinner";

function ChatsPage() {
  const [errorLoading, setErrorLoading] = useState(false);

  const location = useLocation();

  let [searchParams] = useSearchParams();

  const [chats, setChats] = useState(null);
  const router = useNavigate();

  const socket = useRef();
  const [texts, setTexts] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [newText, setNewText] = useState("");
  const [chatUserData, setChatUserData] = useState({
    name: "",
    profilePicUrl: "",
  });
  const user = useBearStore((state) => state.user);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const getChats = async () => {
      try {
        const token = cookie.get("token");
        const chats = await axios.get(`${baseUrl}/api/chats`, {
          headers: { Authorization: token },
        });
        setChats(chats.data);
      } catch (error) {
        setErrorLoading(true);
      }
    };
    getChats();
  }, []);
  //This ref is for persisting the state of query string in the url(i.e. the chat.textsWith) throughout re-renders
  //when the component re-rendered, the query string was resetting due to a bug in next.js
  const openChatId = useRef("");
  const [showChatSearch, setShowChatSearch] = useState(false);

  //SOCKET.io useEffect (used for connection)
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl); //establishing connection with server;
    }

    if (socket.current) {
      //to send data from socket, we use emit
      socket.current.emit("join", { userId: user._id });
      //sends a connection event 'join' to the server

      //listens to the event 'connectedUsers' from the server
      socket.current.on("connectedUsers", ({ users }) => {
        setConnectedUsers(users);
      });
    }

    if (
      chats &&
      chats.length > 0 &&
      !searchParams.get("chat") &&
      location.pathname === "/chats"
    ) {
      if (!cookie.get("token")) {
        return;
      }
      router(`/chats?chat=${chats[0].textsWith}`, undefined, {
        shallow: true,
      });
      //shallow is used to push a page on the router stack without refreshing
    }

    // cleanup not needed in v4.0.1
    // return () => {
    //   //cleanup function to disconnect the user. This is called on component unmount
    //   // if (socket.current) {
    //   //   socket.current.emit("disconnect");
    //   //   socket.current.off(); //this removes the event listener
    //   // }
    //   console.log("exiting chat");
    // };
  }, []);

  //LOAD TEXTS useEffect. Runs whenever router.query.chat changes, so basically whenever the user clicks on a different user
  const chatContainerRef = useRef(null);

  // Scroll handling for pagination
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || page === 0) return;

    // This effect runs after texts update.
    // Ideally we want to adjust scroll here if we just prepended.
    // However, capturing oldHeight *before* render is hard with just functional updates.
    // We will handle it with a helper function in the socket listener instead or use a robust hook.
    // For simplicity in this `replace_file_content` limitation:
    // We will rely on the listener logic to set a flag or handle it.
  }, [texts, page]);


  const [loading, setLoading] = useState(false);

  //LOAD TEXTS useEffect
  useEffect(() => {
    const loadTexts = () => {
      setLoading(true);
      socket.current.emit("loadTexts", {
        userId: user._id,
        textsWith: searchParams.get("chat"),
        page: page,
      });

      socket.current.on("textsLoaded", ({ chat, textsWithDetails }) => {
        setLoading(false);
        if (textsWithDetails) {
          setTexts([]);
          setChatUserData({
            name: textsWithDetails.name,
            profilePicUrl: textsWithDetails.profilePicUrl,
          });
          openChatId.current = searchParams.get("chat");
        } else {
          if (page === 0) {
            setTexts(chat.texts);
            scrollToBottom();
            setChatUserData({
              name: chat.textsWith.name,
              profilePicUrl: chat.textsWith.profilePicUrl,
            });
            openChatId.current = chat.textsWith._id;
          } else {
            // Preserve scroll position
            const container = chatContainerRef.current;
            const oldHeight = container ? container.scrollHeight : 0;

            setTexts((prev) => [...chat.texts, ...prev]);

            // Restore scroll position after render
            // We use setTimeout to ensure DOM has updated
            if (container) {
              setTimeout(() => {
                const newHeight = container.scrollHeight;
                container.scrollTop = newHeight - oldHeight;
              }, 0);
            }
          }
          if (chat.texts.length < 10) setHasMore(false);
        }
      });
    };

    if (socket.current && searchParams.get("chat")) {
      loadTexts();
    }

    return () => {
      if (socket.current) {
        socket.current.off("textsLoaded");
      }
    };
  }, [searchParams.get("chat"), page]);

  // Reset page when chat changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    // We don't need to clear texts here as loadTexts will handle it, 
    // but clearing might prevent flashing old chat content.
    // Left as is for now.
  }, [searchParams.get("chat")]);

  const sendText = (e, text) => {
    e.preventDefault();
    if (socket.current) {
      socket.current.emit("sendNewText", {
        userId: user._id,
        userToTextId: openChatId.current,
        text,
      });
    }
    setNewText("");
  };

  //Confirming a sent text and receiving the texts useEffect
  //socket.current.on is basically a listener that keeps listening for the event until we've moved to another page.
  //it just needs to be activated once on component mount
  //Confirming a sent text and receiving the texts useEffect
  useEffect(() => {
    if (socket.current) {
      socket.current.on("textSent", ({ newText }) => {
        if (newText.receiver === openChatId.current) {
          setTexts((prev) => [...prev, newText]);

          setChats((prev) => {
            const previousChat = prev.find(
              (chat) => chat.textsWith === newText.receiver
            );
            previousChat.lastText = newText.text;
            previousChat.date = newText.date;

            return [...prev];
          });
          scrollToBottom();
        }
      });

      socket.current.on("newTextReceived", async ({ newText, userDetails }) => {
        if (newText.sender === openChatId.current) {
          setTexts((prev) => [...prev, newText]);

          setChats((prev) => {
            const previousChat = prev.find(
              (chat) => chat.textsWith === newText.sender
            );
            previousChat.lastText = newText.text;
            previousChat.date = newText.date;
            return [...prev];
          });
          scrollToBottom();
        } else {
          setChats((prev) => {
            const ifPreviouslyTexted =
              prev.filter((chat) => chat.textsWith === newText.sender).length >
              0;

            if (ifPreviouslyTexted) {
              const previousChat = prev.find(
                (chat) => chat.textsWith === newText.sender
              );
              previousChat.lastText = newText.text;
              previousChat.date = newText.date;
              return [...prev];
            } else {
              const newChat = {
                textsWith: newText.sender,
                name: userDetails.name,
                profilePicUrl: userDetails.profilePicUrl,
                lastText: newText.text,
                date: newText.date,
              };
              return [newChat, ...prev];
            }
          });
        }
      });
    }
  }, []);

  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const markMessagesAsRead = async () => {
      try {
        await axios.post(
          `${baseUrl}/api/chats`,
          {},
          {
            headers: { Authorization: cookie.get("token") },
          }
        );
      } catch (error) {
        console.log(error);
      }
    };

    markMessagesAsRead();
  }, []);

  return (
    <div className="bg-gray-100">
      <Header user={user} />
      <main className="flex" style={{ height: "calc(100vh - 4.5rem)" }}>
        <div className="hidden md:block">
          <Sidebar user={user} maxWidth={"250px"} />
        </div>

        <div className="flex flex-grow mx-auto h-full w-full max-w-2xl lg:max-w-[65rem] xl:max-w-[70.5rem] bg-white rounded-lg overflow-hidden">
          {/* List Column */}
          <div
            style={{
              borderLeft: "1px solid lightgrey",
              borderRight: "1px solid lightgrey",
              fontFamily: "Inter",
            }}
            className={`lg:min-w-[27rem] relative pt-4 w-full md:w-auto h-full flex-col ${searchParams.get("chat") ? "hidden md:flex" : "flex"}`}
          >
            <Title>Chats</Title>
            <div
              onClick={() => setShowChatSearch(true)}
              className="flex items-center rounded-full bg-gray-100 p-2 m-4 h-12"
            >
              <SearchIcon className="h-5 text-gray-600 px-1.5 md:px-0 cursor-pointer" />
              <input
                className="ml-2 bg-transparent outline-none placeholder-gray-500 w-full font-thin flex items-center flex-shrink"
                type="text"
                placeholder="Search users"
              />
            </div>

            {showChatSearch && (
              <ChatSearch
                setShowChatSearch={setShowChatSearch}
                chats={chats}
                setChats={setChats}
              />
            )}

            <div className="mt-4 flex-grow overflow-y-auto" style={{ borderTop: "1px solid #efefef" }}>
              <>
                {chats && chats.length > 0 ? (
                  chats.map((chat) => (
                    <ChatDiv
                      key={chat.textsWith}
                      onClick={() => router(`/chats?chat=${chat.textsWith}`)}
                    >
                      <div className="relative">
                        <UserImage src={chat.profilePicUrl} alt="userimg" />
                        {connectedUsers.length > 0 &&
                          connectedUsers.filter(
                            (user) => user.userId === chat.textsWith
                          ).length > 0 ? (
                          <FiberManualRecordIcon
                            style={{
                              color: "#55d01d",
                              fontSize: "1.85rem",
                              position: "absolute",
                              bottom: "-.5rem",
                              right: "0rem",
                            }}
                          />
                        ) : (
                          <></>
                        )}
                      </div>

                      <div className="ml-1">
                        <Name>{chat.name}</Name>
                        <TextPreview>
                          {chat.lastText && chat.lastText.length > 30
                            ? `${chat.lastText.substring(0, 30)}...`
                            : chat.lastText}
                        </TextPreview>
                      </div>
                      {chat.date && (
                        <Date>{calculateTime(chat.date, true)}</Date>
                      )}
                    </ChatDiv>
                  ))
                ) : (
                  <>
                    <p className="p-5 text-gray-500">
                      Start a chat with someone!
                    </p>
                  </>
                )}
              </>
            </div>
          </div>

          {/* Chat Window Column */}
          <div
            className={`flex-1 flex-col h-full ${!searchParams.get("chat") ? "hidden md:flex" : "flex"}`}
            style={{
              borderRight: "1px solid lightgrey",
              fontFamily: "Inter",
            }}
          >
            {searchParams.get("chat") ? (
              <>
                {chatUserData && chatUserData.profilePicUrl ? (
                  <ChatHeaderDiv>
                    {/* Back Button for Mobile */}
                    <div
                      onClick={() => router("/chats")}
                      className="md:hidden mr-2 cursor-pointer p-1 rounded-full hover:bg-gray-100"
                    >
                      <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                    </div>

                    <UserImage src={chatUserData.profilePicUrl} alt="userimg" />
                    <div>
                      <ChatName>{chatUserData.name}</ChatName>

                      {connectedUsers.length > 0 &&
                        connectedUsers.filter(
                          (user) => user.userId === openChatId.current
                        ).length > 0 && <LastActive>{"Online"}</LastActive>}
                    </div>
                  </ChatHeaderDiv>
                ) : (
                  <div
                    className="max-w-[28rem]"
                    style={{ padding: "1rem 0.9rem" }}
                  >
                    <Facebook />
                  </div>
                )}

                <div
                  className="flex flex-col justify-between flex-grow overflow-hidden"
                >
                  <div
                    ref={chatContainerRef}
                    className="mt-3 pl-4 pr-4 overflow-y-auto flex-grow"
                    style={{ scrollbarWidth: "thin" }}
                    onScroll={(e) => {
                      if (e.currentTarget.scrollTop === 0 && hasMore && texts.length > 0) {
                        setPage(prev => prev + 1);
                      }
                    }}
                  >
                    <>
                      {loading && (
                        <div className="flex justify-center p-2">
                          <Loader type="Oval" color="#9333ea" height={30} width={30} />
                        </div>
                      )}
                      {texts.length > 0 ? (
                        texts.map((text, i) => (
                          <Chat
                            key={i}
                            user={user}
                            text={text}
                            setTexts={setTexts}
                            textsWith={openChatId.current}
                          />
                        ))
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          Say hello! 👋
                        </div>
                      )
                      }
                      < EndOfMessage ref={endOfMessagesRef} />
                    </>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid #efefef",
                      borderBottom: "1px solid #efefef",
                    }}
                    className="bg-white"
                  >
                    <form
                      className="flex items-center rounded-full bg-gray-100 p-4 m-4 max-h-12"
                    >
                      <input
                        className="bg-transparent outline-none placeholder-gray-500 w-full font-thin flex items-center flex-shrink"
                        type="text"
                        value={newText}
                        onChange={(e) => {
                          setNewText(e.target.value);
                        }}
                        placeholder="Send a new text..."
                      />
                      <button
                        disabled={!newText}
                        type="submit"
                        onClick={(e) => sendText(e, newText)}
                        className={`ml-2 transition-all duration-200 transform ${newText ? 'text-purple-600 hover:scale-110 cursor-pointer' : 'text-gray-300 cursor-default'}`}
                      >
                        <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center justify-center h-full text-gray-400 select-none">
                <div className="text-center">
                  <ChatIconOutline className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatsPage;

const Title = styled.p`
  user-select: none;
  font-size: 1.65rem;
  font-weight: 600;
  font-family: Inter;
  margin: 1rem;
`;

const UserImage = styled.img`
  height: 3.8rem;
  width: 3.8rem;
  border-radius: 50%;
  object-fit: cover;
`;

const ChatDiv = styled.div`
  display: flex;
  cursor: pointer;
  border-radius: 0.3rem;
  border-bottom: 1px solid #efefef;
  font-family: Inter;
  padding: 1rem 0.9rem;
  align-items: flex-start;
  column-gap: 0.6rem;
  :hover {
    background-color: rgba(243, 244, 246);
  }
`;

const ChatHeaderDiv = styled.div`
  display: flex;
  cursor: pointer;
  border-radius: 0.3rem;
  border-bottom: 1px solid #efefef;
  font-family: Inter;
  padding: 1rem 0.9rem;
  align-items: center;
  column-gap: 0.6rem;
`;
const Name = styled.p`
  user-select: none;
  font-weight: 600;
  font-size: 1.08rem;
  font-family: Inter;
`;

const ChatName = styled.p`
  user-select: none;
  font-weight: 600;
  font-size: 1.2rem;
  font-family: Inter;
`;

const TextPreview = styled.p`
  font-family: Inter;
  margin-top: -0.95rem;
`;

const Date = styled.p`
  font-family: Inter;
  margin-left: auto;
`;

const LastActive = styled.p`
  user-select: none;
  font-size: 0.9rem;
  color: rgba(107, 114, 128);
  margin-top: -1.1rem;
`;

const TextInputDiv = styled.div`
  padding: 1rem;
`;

const EndOfMessage = styled.div`
  margin-bottom: 30px;
`;
