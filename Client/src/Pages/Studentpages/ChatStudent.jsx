import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ChatBox from "../../Component/Studentcomponents/Studashboard/ChatBox";

const ChatStudent = () => {
  const [error, setError] = useState("");
  // const sendMessage = async (e) => {
  //   e.preventDefault();
  //   socket.emit('message', {room, message});
  //   try {
  //     const response = await axios.post("http://localhost:7000/api/chats/send-message",
  //       {
  //         senderId: userId,
  //         receiverId: '66321e9acf8d31d7e3316ec1',
  //         message
  //       }
  //     )

  //   } catch (error) {
  //     console.log(error);
  //     setSendError('Error sending message!!!');
  //   }
  //   setMessage('');
  // };

  // useEffect(() => {
  //   // Event listener for receiving messages
  //   socket.on('connect', () => {
  //     setSocketId(socket.id);
  //     console.log('Connected');
  //   });
  //   socket.on('received', (data) => {
  //     console.log('received', data);
  //     setMessages((messages) => [...messages, data]);
  //   })

  //   socket.on('welcome', (s) => {
  //     console.log(s);
  //   })

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   const totalCon = messages+sentMsg
  //   setConversation((conversation) => [...conversation, totalCon])
  // }, [messages, sentMsg])
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const token = localStorage.getItem("token");

  if (!token) {
      navigate("/student-login");
      return;
  }

  useEffect(() => {
    // Fetch teachers when the component mounts
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7000/api/students/chat-all-teachers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ); // Adjust the API endpoint
        if (response.status === 201) {
          console.log(response.data);
          setTeachers(response.data); // Assuming the API returns an array of teacher objects
        } else {
          setError(response.status, response.data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error.message);
        setError(error.message);
      }
    };
    fetchTeachers();
  }, []);

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
  };

  return (
    <div className="mt-16">
      <h1>Student Dashboard</h1>
      <ul>
        {teachers.map((teacher) => (
          <li key={teacher._id}>
            <button onClick={() => handleTeacherClick(teacher)}>
              {teacher.name}
            </button>
          </li>
        ))}
      </ul>
      <h4>{error}</h4>
      {selectedTeacher && (
        <ChatBox teacher={selectedTeacher} /> // Render the chatbox if a teacher is selected
      )}
    </div>
  );
};

export default ChatStudent;
