import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatBoxTeacher from "../../Component/TeachersComponents/ChatBoxTeacher";
import { Link, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@react-hook/media-query';
import { useJwt } from 'react-jwt'

const ChatTeacher = () => {
  const navigate = useNavigate();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const userName = decodedToken ? decodedToken.name : "No Name Found";
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isTeacherSectionVisible, setIsTeacherSectionVisible] = useState(true);
  const isSmallScreen = useMediaQuery('(max-width: 640px)')

  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login"); // Redirect to login page if not authenticated
    return;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds
      // console.log(tokenExpiration)

      if (tokenExpiration && tokenExpiration < Date.now()) {
        // Token expired, remove from local storage and redirect to login page
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [decodedToken])

  useEffect(() => {
    // Fetch students when the component mounts
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "https://api.mentorlanguageinstitute.com/api/teachers/chat-all-students",
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

    if (isSmallScreen && !isOpen) {
      setIsTeacherSectionVisible(false);
      setIsOpen(true); // Open the right portion
    } else if (isSmallScreen && isOpen) {
      setIsOpen(false);
      setIsTeacherSectionVisible(true); // Close the right portion
    }
  };





  return (
    <>
      <div>



        <div class=" h-screen p-0">
          <div class="md:flex border border-grey rounded shadow-lg h-full">

            {isTeacherSectionVisible && (
              <div className={`md:w-1/3 border flex flex-col ${isSmallScreen && !isOpen ? 'w-full' : 'p-2'}`}>
                {/* Left portion */}


                <div class="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
                  <div className='flex items-center'>
                    <img class="w-10 h-10 rounded-full" src="https://static.thenounproject.com/png/363640-200.png" />
                    <span className='ml-1'>{userName}</span>
                  </div>


                </div>

                <div class="bg-grey-lightest w-full h-0.5 bg-gray-600 rounded-md my-4">

                </div>

                <div class="bg-grey-lighter flex-1 overflow-auto">
                  {students.map((student, index) => (
                    <div class="bg-white px-3 flex items-center hover:bg-grey-lighter cursor-pointer sm:pointer" onClick={() => handleStudentClick(student)}>
                      <div>
                        <img class="h-12 w-12 rounded-full"
                          src="https://static.thenounproject.com/png/363640-200.png" />
                      </div>
                      <div class="ml-4 flex-1 border-b border-grey-lighter py-4">
                        <div class="flex items-bottom justify-between">
                          <p class="text-grey-darkest">
                            {student.name}
                          </p>

                        </div>
                        <p class="text-grey-dark mt-1 text-sm">
                          {/* {classData.map((classItem, index) => {
                    if (classItem.enrolledStudents.includes(student._id)) {
                      return (
                        <span key={classItem._id} className="text-xs text-grey-dark ">
                          {index === 0 ? ( // Check if it's the first item
                            <span>{classItem.classTitle}</span>
                          ) : ( // If not the first item, print on a new line
                            <React.Fragment>
                              <br />
                              {classItem.classTitle}
                            </React.Fragment>
                          )}
                        </span>
                      );
                    }
                    return null;
                  })} */}
                        </p>
                      </div>
                    </div>
                  ))}

                </div>

              </div>
            )}

            {selectedStudent && (
              <ChatBoxTeacher student={selectedStudent} isOpen={isOpen} setIsOpen={setIsOpen} isSmallScreen={isSmallScreen} setIsTeacherSectionVisible={setIsTeacherSectionVisible} /> // Render the chatbox if a student is selected
            )}

          </div>

        </div>
      </div>





      {/* <div className="mt-16">
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
      </div> */}

    </>
  );
};

export default ChatTeacher;
