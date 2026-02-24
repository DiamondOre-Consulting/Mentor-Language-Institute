import React, { useState, useEffect, useMemo, useRef } from "react";
import { useApi } from "../../api/useApi";
import io from "socket.io-client";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";
// import { socket } from './socket';
import userimg2 from "..//..//assets/userimg2.png";

const ChatBoxTeacher = ({
  student,
  isOpen,
  setIsOpen,
  isSmallScreen,
  setIsTeacherSectionVisible,
}) => {
  const navigate = useNavigate();
  const { get } = useApi();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const userId = decodedToken ? decodedToken.userId : null;
  const token = localStorage.getItem("token");
  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:7000";
  const socket = useMemo(
    () =>
      io(socketUrl, {
        auth: {
          token,
        },
      }),
    [socketUrl, token]
  );
  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login?role=teacher");
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch chat history for the selected student
    if (!student?._id) return;
    fetchChatHistory(student._id);

    // Listen for incoming messages
    const handleReceive = (message) => {
      // Add the new message to the chat history
      // console.log("This is msg: ", message);
      setChatHistory((prev) => [...prev, message]);
    };
    socket.on("receive-message", handleReceive);

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off("receive-message", handleReceive);
    };
  }, [student?._id, socket]);

  useEffect(() => {
    if (isUserAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isUserAtBottom]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      setIsUserAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }
  };

  const fetchChatHistory = async (studentId) => {
    try {
      const response = await get({
        url: `/chats/get-messages-teacher/${studentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      // console.log(response.data);
      if (response.status === 200) {
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
        receiverId: student._id,
        receiverRole: "student",
        message: newMessage,
      });
      // Clear the input field
      setNewMessage("");
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

  return (
    <>
      <div
        className={`md:w-2/3 border md:flex bg-gray-200 flex-col ${
          isOpen ? "w-full h-full" : "hidden"
        }`}
      >
        <div className="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center w-full fixed bg-white md:static">
          <div className="flex items-center bg-white">
            <div>
              <img className="w-10 h-10 rounded-full" src={userimg2} />
            </div>
            <div className="ml-4">
              <p className="text-grey-darkest">
                <h1> {student.name}</h1>
              </p>
            </div>
          </div>

          {isSmallScreen && isOpen && (
            <div className="bg-grey-lighter px-4 py-4 flex items-center">
              <button
                onClick={handleClick}
                className="bg-orange-400 p-1 rounded-md text-gray-100 text-sm"
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
          style={{ paddingTop: "80px" }}
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
                    <span className="text-xs ml-2">
                      {" "}
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white px-4 py-4 flex fixed bottom-0 bg-white w-full md:relative  md:w-auto items-center ">
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
              className="bg-green-300 rounded-md px-6 py-2"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* <div>
        <h2>Chat with {student.name}</h2>
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

export default ChatBoxTeacher;


