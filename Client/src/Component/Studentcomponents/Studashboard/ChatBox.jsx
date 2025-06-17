import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";
import userimg2 from "..//..//..//assets/userimg2.png";

// import { socket } from './socket';

const ChatBox = ({
  teacher,
  isOpen,
  isSmallScreen,
  setIsOpen,
  setIsTeacherSectionVisible,
}) => {
  const navigate = useNavigate();
  const { decodedToken, isExpired } = useJwt(localStorage.getItem("token"));
  const userId = decodedToken ? decodedToken.userId : null;
  const socket = useMemo(
    () => io("https://mentor-backend-rbac6.ondigitalocean.app"),
    []
  );
  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || isExpired) {
      navigate("/student-login");
    }
  }, [token, isExpired, navigate]);

  if (!token) {
    navigate("/student-login");
    return;
  }

  useEffect(() => {
    // Fetch chat history for the selected teacher
    fetchChatHistory(teacher._id);

    // Listen for incoming messages
    socket.on("receive-message", (message) => {
      // Add the new message to the chat history
      // console.log("This is msg: ", message);
      setChatHistory((chatHistory) => [...chatHistory, message]);
    });

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off("receive-message");
    };
  }, [teacher, chatHistory]);

  useEffect(() => {
    if (isUserAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isUserAtBottom]);

  const fetchChatHistory = async (teacherId) => {
    try {
      const response = await axios.get(
        `https://mentor-backend-rbac6.ondigitalocean.app/api/chats/get-messages-student/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data);
      if (response.status === 200) {
        // console.log(response.data)
        setChatHistory(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error.message);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Emit the new message to the server
      // console.log(newMessage);
      socket.emit("send-message", {
        senderId: userId,
        receiverId: teacher._id,
        message: newMessage,
      });
      // Clear the input field
      setNewMessage("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleClick = () => {
    if (isSmallScreen && isOpen) {
      setIsOpen(false);
      setIsTeacherSectionVisible(true);
    } else {
      // console.log("navigating.............");
      navigate(-1);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      if (isSmallScreen && isOpen) {
        setIsUserAtBottom(scrollTop + clientHeight >= scrollHeight - 40);
      } else {
        setIsUserAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
      }
    }
  };

  return (
    <>
      <div
        className={`md:w-2/3 border  bg-gray-200 md:flex flex-col ${
          isOpen ? "w-full h-full" : "hidden"
        }`}
      >
        <div className="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center w-full fixed bg-white ">
          <div className="flex items-center bg-white">
            <div>
              <img className="w-10 h-10 rounded-full" src={userimg2} />
            </div>
            <div className="ml-4">
              <p className="text-grey-darkest">
                <h1>{teacher.name}</h1>
              </p>
            </div>
          </div>

          {isSmallScreen && isOpen && (
            <div className="flex items-center px-4 py-4 bg-grey-lighter">
              <button
                onClick={handleClick}
                className="p-1 text-sm text-gray-100 bg-orange-400 rounded-md"
              >
                Go Back
              </button>
            </div>
          )}
        </div>

        <div
          className="flex-1 overflow-auto bg-gray-200 "
          ref={chatContainerRef}
          onScroll={handleScroll}
          style={{ marginTop: "80px" }}
        >
          <div className="py-2 px-3 mb-16 md:mb-0">
            {chatHistory.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.senderId === userId ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`rounded py-2 px-3 ${
                    message.senderId === userId ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <p className="text-md mt-1">{message.message}</p>
                  <p className="text-right  text-grey-dark mt-1">
                    <span className="text-xs">
                      {new Date(message.createdAt).toLocaleDateString()}{" "}
                    </span>
                    <span className="ml-2 text-xs">
                      {" "}
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white px-4 py-4 flex  fixed bottom-0 bg-white w-full md:relative  md:w-auto items-center ">
          <div className="flex-1 mx-4">
            <input
              className="w-full border rounded px-2 py-2"
              type="text"
              value={newMessage}
              onKeyPress={handleKeyPress}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
          </div>
          <div>
            <button
              className="px-6 py-2 bg-green-300 rounded-md"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* <div>
        <h2>Chat with {teacher.name}</h2>
        <div>
          {chatHistory.map((message) => (
            <div key={message._id}>{message.message}</div>
          ))}
        </div>
        <div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div> */}
    </>
  );
};

export default ChatBox;
