import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";
import userimg2 from "..//..//assets/userimg2.png";

const ChatBoxAdmin = ({
  selectedTeacherId,
  selectedStudentId,
  isOpen,
  setIsOpen,
  isSmallScreen,
  setIsTeacherSectionVisible,
}) => {
  const navigate = useNavigate();
  const { decodedToken, isExpired } = useJwt(localStorage.getItem("token"));
  const userId = decodedToken ? decodedToken.userId : null;
  console.log(userId);
  const socket = useMemo(
    () => io("https://mentor-language-institute-backend-hbyk.onrender.com"),
    []
  );
  const [chatHistory, setChatHistory] = useState([]);
  const [teacher, setTeacher] = useState("");
  const [student, setStudent] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchChatHistory = async (selectedTeacherId, selectedStudentId) => {
      try {
        const response = await axios.get(
          `https://mentor-language-institute-backend-hbyk.onrender.com/api/chats/get-messages-admin/${selectedTeacherId}/${selectedStudentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log(response.data);
        if (response.status === 200) {
          setChatHistory(response.data.messages);
          console.log(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error.message);
      }
    };

    fetchChatHistory(selectedTeacherId, selectedStudentId); // Corrected function call
  }, [selectedTeacherId, selectedStudentId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // No token found, redirect to login page
      navigate("/login");
    }

    const fetchTeacherDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        // Fetch associates data from the backend
        const response = await axios.get(
          `https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/all-teachers/${selectedTeacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status == 200) {
          const oneteacher = response.data;
          setTeacher(oneteacher);
          // console.log("oneTeacher", teacher);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchTeacherDetails();
  }, [selectedTeacherId]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        // Fetch student details
        const studentResponse = await axios.get(
          `https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/all-students/${selectedStudentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (studentResponse.status === 200) {
          const studentData = studentResponse.data;
          setStudent(studentData);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchStudentDetails();
  }, [selectedStudentId]);

  const handleClick = () => {
    if (isSmallScreen && isOpen) {
      setIsOpen(false);
      setIsTeacherSectionVisible(true);
    } else {
      //   console.log("navigating.............");
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
        <div class="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center w-full fixed bg-white md:static absolue top-0">
          <div class="flex items-center bg-white">
            <div>
              <img class="w-10 h-10 rounded-full" src={userimg2} />
            </div>
            <div class="ml-4">
              <p class="text-grey-darkest">
                <div className="flex">
                  <div className="flex flex-col">
                    <p className="text-xs -mb-1  ">Teacher</p>
                    <p>{teacher.name} </p>
                  </div>
                  <div className="bg-black w-0.5 ml-4 h-10"></div>
                  <div className="ml-4 ">
                    <p className="text-xs -mb-1 ">Student</p>
                    <p>{student.name}</p>
                  </div>
                </div>
                {/* <h1>{teacher.name} | {student.name}</h1> */}
              </p>
            </div>

            {isSmallScreen && isOpen && (
              <div className="bg-grey-lighter px-4 py-4 flex ml-10 items-center">
                <button
                  onClick={handleClick}
                  className="bg-orange-400 p-1 rounded-md text-gray-100 text-sm"
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        </div>

        <div class="flex-1 overflow-auto bg-gray-200">
          <div class="py-2 px-3">
            {chatHistory.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.senderId === teacher._id
                    ? "justify-start"
                    : "justify-end"
                } mb-2`}
              >
                <div
                  className={`rounded py-2 px-3 ${
                    message.senderId === teacher._id
                      ? "bg-gray-100"
                      : "bg-green-100"
                  }`}
                >
                  <span className="text-xs bg-orange-200 text-gray-900 rounded-full px-2 py-1">
                    {message.senderId === teacher._id ? "Teacher" : "Student"}
                  </span>
                  <p class="text-md mt-1">{message.message}</p>
                  <p class="text-right  text-grey-dark mt-1">
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
      </div>
    </>
  );
};

export default ChatBoxAdmin;
