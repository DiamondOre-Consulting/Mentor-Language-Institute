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

                  <div class="flex">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#727A7E" d="M12 20.664a9.163 9.163 0 0 1-6.521-2.702.977.977 0 0 1 1.381-1.381 7.269 7.269 0 0 0 10.024.244.977.977 0 0 1 1.313 1.445A9.192 9.192 0 0 1 12 20.664zm7.965-6.112a.977.977 0 0 1-.944-1.229 7.26 7.26 0 0 0-4.8-8.804.977.977 0 0 1 .594-1.86 9.212 9.212 0 0 1 6.092 11.169.976.976 0 0 1-.942.724zm-16.025-.39a.977.977 0 0 1-.953-.769 9.21 9.21 0 0 1 6.626-10.86.975.975 0 1 1 .52 1.882l-.015.004a7.259 7.259 0 0 0-5.223 8.558.978.978 0 0 1-.955 1.185z"></path></svg>
                    </div>
                    <div class="ml-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path opacity=".55" fill="#263238" d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"></path></svg>
                    </div>
                    <div class="ml-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fill-opacity=".6" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
                    </div>
                  </div>
                </div>

                <div class="py-2 px-2 bg-grey-lightest">
                  <input type="text" class="w-full px-2 py-2 text-sm" placeholder="Search or start new chat" />
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
              <ChatBoxTeacher student={selectedStudent}  isOpen={isOpen} setIsOpen={setIsOpen} isSmallScreen={isSmallScreen} setIsTeacherSectionVisible={setIsTeacherSectionVisible}/> // Render the chatbox if a student is selected
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
