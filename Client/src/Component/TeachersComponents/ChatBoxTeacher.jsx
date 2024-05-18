import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";
// import { socket } from './socket';

const ChatBoxTeacher = ({ student }) => {
  const navigate = useNavigate();
  const { decodedToken, isExpired } = useJwt(localStorage.getItem("token"));
  const userId = decodedToken ? decodedToken.userId : null;
  console.log(userId);
  const socket = useMemo(() => io("http://localhost:7000"), []);
  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState("");

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
    // Fetch chat history for the selected student
    fetchChatHistory(student._id);

    // Listen for incoming messages
    socket.on("receive-message", (message) => {
      // Add the new message to the chat history
      console.log("This is msg: ", message);
      setChatHistory((chatHistory) => [...chatHistory, message]);
    });

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off("receive-message");
    };
  }, [student, chatHistory]);

  const fetchChatHistory = async (studentId) => {
    try {
      const response = await axios.get(
        `http://localhost:7000/api/chats/get-messages-teacher/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
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
      console.log(newMessage);
      socket.emit("send-message", {
        senderId: userId,
        receiverId: student._id,
        message: newMessage,
      });
      // Clear the input field
      setNewMessage("");
    }
  };

  return (
    <div>
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
    </div>
  );
};

export default ChatBoxTeacher;
