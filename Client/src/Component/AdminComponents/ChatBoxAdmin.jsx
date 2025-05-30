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
          `http://localhost:7000/api/chats/get-messages-admin/${selectedTeacherId}/${selectedStudentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log(response.data);
        if (response.status === 200) {
          setChatHistory(response.data.messages);
        }
      } catch (error) {
        console.error("");
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
          `http://localhost:7000/api/admin-confi/all-teachers/${selectedTeacherId}`,
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
        console.log("");
      }
    };

    fetchTeacherDetails();
  }, [selectedTeacherId]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        // Fetch student details
        const studentResponse = await axios.get(
          `http://localhost:7000/api/admin-confi/all-students/${selectedStudentId}`,
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
        console.log("");
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
        className={`md:w-2/3 border md:flex bg-gray-200 flex-col ${isOpen ? "w-full h-full" : "hidden"
          }`}
      >
        <div className="fixed top-0 flex flex-row items-center justify-between w-full px-3 py-2 bg-white bg-grey-lighter md:static absolue">
          <div className="flex items-center bg-white">
            <div>
              <img className="w-10 h-10 rounded-full" src={userimg2} />
            </div>
            <div className="ml-4">
              <p className="text-grey-darkest">
                <div className="flex">
                  <div className="flex flex-col">
                    <p className="-mb-1 text-xs ">Teacher</p>
                    <p>{teacher.name} </p>
                  </div>
                  <div className="bg-black w-0.5 ml-4 h-10"></div>
                  <div className="ml-4 ">
                    <p className="-mb-1 text-xs ">Student</p>
                    <p>{student.name}</p>
                  </div>
                </div>
                {/* <h1>{teacher.name} | {student.name}</h1> */}
              </p>
            </div>

            {isSmallScreen && isOpen && (
              <div className="flex items-center px-4 py-4 ml-10 bg-grey-lighter">
                <button
                  onClick={handleClick}
                  className="p-1 text-sm text-gray-100 bg-orange-400 rounded-md"
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-200">
          <div className="px-3 py-2">
            {chatHistory.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.senderId === teacher._id
                  ? "justify-start"
                  : "justify-end"
                  } mb-2`}
              >
                <div
                  className={`rounded py-2 px-3 ${message.senderId === teacher._id
                    ? "bg-gray-100"
                    : "bg-green-100"
                    }`}
                >
                  <span className="px-2 py-1 text-xs text-gray-900 bg-orange-200 rounded-full">
                    {message.senderId === teacher._id ? "Teacher" : "Student"}
                  </span>
                  <p className="mt-1 text-md">{message.message}</p>
                  <p className="mt-1 text-right text-grey-dark">
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
      </div>
    </>
  );
};

export default ChatBoxAdmin;
