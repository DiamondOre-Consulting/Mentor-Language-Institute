import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";
// import { socket } from './socket';

const ChatBox = ({ teacher, isOpen , isSmallScreen , setIsOpen , setIsTeacherSectionVisible}) => {
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
    // Fetch chat history for the selected teacher
    fetchChatHistory(teacher._id);

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
  }, [teacher, chatHistory]);

  const fetchChatHistory = async (teacherId) => {
    try {
      const response = await axios.get(
        `http://localhost:7000/api/chats/get-messages-student/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      if (response.status === 200) {
        console.log(response.data)
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
        receiverId: teacher._id,
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
      console.log("navigating.............");
      navigate(-1);
    }
  };

  return (

    <>
      <div className={`md:w-2/3 border md:flex flex-col ${isOpen ? 'w-full h-full' : 'hidden'}`}>

        <div class="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
          <div class="flex items-center">
            <div>
              <img class="w-10 h-10 rounded-full" src="https://static.thenounproject.com/png/363640-200.png" />
            </div>
            <div class="ml-4">
              <p class="text-grey-darkest">
                <h1>{teacher.name}</h1>
              </p>

            </div>
          </div>

          {isSmallScreen && isOpen && (
            <div className="bg-grey-lighter px-4 py-4 flex items-center">
              <button onClick={handleClick} className='bg-orange-400 p-1 rounded-md text-gray-100 text-sm'>
                Go Back
              </button>
            </div>
          )}
        </div>


        <div class="flex-1 overflow-auto bg-gray-200" >
          <div class="py-2 px-3">


            <div class="flex justify-center mb-4">
              <div class="rounded py-2 px-4 bg-yellow-200" >
                <p class="text-xs">
                  Messages to this chat and calls are now secured with end-to-end encryption. Tap for more info.
                </p>
              </div>
            </div>

            {chatHistory.map((message) => (

              <div
                key={message._id}
                className={`flex ${message.senderId === userId ? "justify-end" : "justify-start"} mb-2`}
              >
                <div className={`rounded py-2 px-3 ${message.senderId === userId ? "bg-green-100" : "bg-gray-100"}`}>

                  <p class="text-sm mt-1">
                    {message.message}
                  </p>
                  <p class="text-right text-xs text-grey-dark mt-1">
                  {new Date(message.createdAt).toLocaleDateString()} 
                  {/* {new Date(message.createdAt).toLocaleTimeString()} */}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>


        <div class="bg-grey-lighter px-4 py-4 flex items-center">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path opacity=".45" fill="#263238" d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"></path></svg>
          </div>
          <div class="flex-1 mx-4">
            <input class="w-full border rounded px-2 py-2"   type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..." />
          </div>
          <div>
          <button className="bg-green-400 p-2" onClick={handleSendMessage}>Send</button>
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
