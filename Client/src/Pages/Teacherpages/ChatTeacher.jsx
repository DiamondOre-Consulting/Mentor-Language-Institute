import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatBoxTeacher from "../../Component/TeachersComponents/ChatBoxTeacher";

const ChatTeacher = () => {
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const token = localStorage.getItem("token");

  if (!token) {
      navigate("/login"); 
      return;
  }

  useEffect(() => {
    // Fetch students when the component mounts
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7000/api/teachers/chat-all-students",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ); // Adjust the API endpoint
        if (response.status === 201) {
          console.log(response.data);
          setStudents(response.data); // Assuming the API returns an array of student objects
        } else {
          setError(response.status, response.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error.message);
        setError(error.message);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  return (
    <div className="mt-16">
      <h1>Teacher Dashboard</h1>
      <ul>
        {students.map((student) => (
          <li key={student._id}>
            <button onClick={() => handleStudentClick(student)}>
              {student.name}
            </button>
          </li>
        ))}
      </ul>
      <h4>{error}</h4>
      {selectedStudent && (
        <ChatBoxTeacher student={selectedStudent} /> // Render the chatbox if a student is selected
      )}
    </div>
  );
};

export default ChatTeacher;
