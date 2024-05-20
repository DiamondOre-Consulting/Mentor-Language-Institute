import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ChatBox from "../../Component/Studentcomponents/Studashboard/ChatBox";
import { useMediaQuery } from '@react-hook/media-query';
import { useJwt } from 'react-jwt'
import { Link, useNavigate } from 'react-router-dom'

const ChatStudent = () => {
  const navigate = useNavigate();
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
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const userName = decodedToken ? decodedToken.name : "No Name Found";
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const [isTeacherSectionVisible, setIsTeacherSectionVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/student-login");
    return;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {

      navigate("/student-login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0;

      if (tokenExpiration && tokenExpiration < Date.now()) {

        localStorage.removeItem("token");
        navigate("/student-login");
      }
    }
  }, [decodedToken])

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

  // const handleTeacherClick = (teacher) => {
  //   setSelectedTeacher(teacher);
  // };


  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher); // Set selected teacher when clicked

    // Check if it's a small screen and the left bar is open
    if (isSmallScreen && !isOpen) {
      setIsTeacherSectionVisible(false);
      setIsOpen(true); // Open the right portion
    } else if (isSmallScreen && isOpen) {
      setIsOpen(false);
      setIsTeacherSectionVisible(true); // Close the right portion
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


      <div>
        <div class=" h-screen">
          <div class="md:flex border border-grey rounded shadow-lg h-full">

            {isTeacherSectionVisible && (
              <div className={`md:w-1/3 border flex flex-col ${isSmallScreen && !isOpen ? 'w-full' : ''}`}>
                {/* Left portion */}


                <div class="py-4 px-3 bg-grey-lighter flex flex-row justify-between items-center ">
                  <div className='flex items-center'>
                    <img class="w-10 h-10 rounded-full" src="https://static.thenounproject.com/png/363640-200.png" />
                    <span className='ml-1'>{userName}</span>
                  </div>

                  <div class="flex">
                    <svg class="h-8 w-8 text-gray-700 cursor-pointer" onClick={handleClick} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="5" y1="12" x2="19" y2="12" />  <line x1="5" y1="12" x2="9" y2="16" />  <line x1="5" y1="12" x2="9" y2="8" /></svg>
                  </div>
                </div>

                <div class="bg-grey-lightest w-full h-0.5 bg-gray-600 rounded-md my-2">
                </div>

                <div class="bg-grey-lighter flex-1 overflow-auto">
                  {teachers.map((teacher, index) => (
                    <div key={teacher._id} class="bg-white px-3 flex items-center hover:bg-grey-lighter cursor-pointer sm:pointer" onClick={() => handleTeacherClick(teacher)}>
                      <div>
                        <img class="h-12 w-12 rounded-full"
                          src="https://static.thenounproject.com/png/363640-200.png" />
                      </div>
                      <div class="ml-4 flex-1 border-b border-grey-lighter py-4">
                        <div class="flex items-bottom justify-between">
                          <p class="text-grey-darkest">
                            {teacher.name}
                          </p>

                        </div>
                        <p class="text-grey-dark mt-1 text-sm">
                          teacher
                        </p>
                      </div>
                    </div>
                  ))}

                </div>

              </div>
            )}
            <h4>{error}</h4>


            {selectedTeacher && (
              <ChatBox teacher={selectedTeacher} isOpen={isOpen} isSmallScreen={isSmallScreen} setIsOpen={setIsOpen} setIsTeacherSectionVisible={setIsTeacherSectionVisible} /> // Render the chatbox if a teacher is selected
            )}


          </div>

        </div>
      </div>


      {/* <div className="mt-16">
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
      </div> */}
    </>
  );
};

export default ChatStudent;
