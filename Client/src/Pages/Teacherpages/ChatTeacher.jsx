import { useState, useEffect } from "react";
import { useApi } from "../../api/useApi";
import ChatBoxTeacher from "../../Component/TeachersComponents/ChatBoxTeacher";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@react-hook/media-query";
import { useJwt } from "react-jwt";
import userimg2 from "..//..//assets/userimg2.png";

const ChatTeacher = () => {
  const navigate = useNavigate();
  const { get } = useApi();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const userName = decodedToken ? decodedToken.name : "No Name Found";
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isTeacherSectionVisible, setIsTeacherSectionVisible] = useState(true);
  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await get({
          url: "/teachers/chat-all-students",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap(); // Adjust the API endpoint
        if (response.status === 201) {
          setStudents(response.data); // Assuming the API returns an array of student objects
        }
      } catch (error) {
        console.error("Error fetching students:", error.message);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);

    if (isSmallScreen && !isOpen) {
      setIsTeacherSectionVisible(false);
      setIsOpen(true);
    } else if (isSmallScreen && isOpen) {
      setIsOpen(false);
      setIsTeacherSectionVisible(true);
    }
  };

  return (
    <>
      <div>
        <div className=" h-screen p-0">
          <div className="md:flex border border-grey rounded shadow-lg h-full ">
            {isTeacherSectionVisible && (
              <div
                className={`md:w-1/3 border flex flex-col  ${
                  isSmallScreen && !isOpen ? "w-full mt-14" : "p-2"
                }`}
              >
                {/* Left portion */}

                <div className="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
                  <div className="flex items-center">
                    <img className="w-10 h-10 rounded-full" src={userimg2} />
                    <span className="ml-1">{userName}</span>
                  </div>
                </div>

                <div className="bg-grey-lightest w-full h-0.5 bg-gray-600 rounded-md my-4"></div>

                <div className="bg-grey-lighter flex-1 overflow-auto">
                  {students.map((student) => (
                    <div
                      key={student?._id || student?.phone}
                      className="bg-white px-3 flex items-center hover:bg-grey-lighter cursor-pointer sm:pointer"
                      onClick={() => handleStudentClick(student)}
                    >
                      <div>
                        <img className="h-12 w-12 rounded-full" src={userimg2} />
                      </div>
                      <div className="ml-4 flex-1 border-b border-grey-lighter py-4">
                        <div className="flex items-bottom justify-between">
                          <p className="text-grey-darkest">{student?.name}</p>
                        </div>
                        <p className="text-grey-dark mt-1 text-sm">
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
              <ChatBoxTeacher
                student={selectedStudent}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                isSmallScreen={isSmallScreen}
                setIsTeacherSectionVisible={setIsTeacherSectionVisible}
              /> // Render the chatbox if a student is selected
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


