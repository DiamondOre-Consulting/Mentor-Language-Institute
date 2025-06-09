import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const TeacherAddStudent = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [userName, setUserName] = useState("");
  const [grade, setGrade] = useState("");
  const [branch, setBranch] = useState("");
  const [courseId, setCourseId] = useState(""); // Added courseId
  const [popupMessage, setPopupMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  console.log(grade);

  console.log("hello");

  useEffect(() => {
    const fetchAllCourses = async () => {
      setLoading(true);
      try {
        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/my-classes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setClassesData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch classes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, [navigate, token]);

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setPopupMessage(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/add-student",
        {
          name,
          phone,
          password,
          userName,
          dob,
          courseId,
          grade,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPopupMessage("Student Added Successfully");
        setName("");
        setPhone("");
        setPassword("");
        setDob("");
        setUserName("");
        setCourseId("");
        setGrade("");
      } else if (response.status === 400) {
        setPopupMessage("Please Enter a Unique UserName");
      } else {
        setPopupMessage("Error in Adding Student");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setPopupMessage("Please Enter a Unique UserName");
      } else {
        setPopupMessage("Error in Adding Student");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  min-h-screen flex items-center justify-center px-4 py-8 bg-white">
      <section className="relative w-full">
        {loading && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
            <ClipLoader
              color={"#FFA500"}
              loading={loading}
              css={override}
              size={70}
            />
          </div>
        )}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl rounded-lg shadow border-t-4 border-orange-400 bg-white">
            <div className="p-6 space-y-4">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-gray-900">
                Student Registration Form
              </h1>
              <form
                className="space-y-4 border p-4 rounded-md"
                onSubmit={handleStudentRegister}
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Username
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Please Enter a unique userName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Student Name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Phone No"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Select Course
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                  >
                    <option value="" disabled>
                      -- Select a Course --
                    </option>
                    {classesData.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.classTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={grade}
                    placeholder="Enter Student Grade"
                    onChange={(e) => setGrade(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      onChange={togglePasswordVisibility}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-900 cursor-pointer">
                      Show Password
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-orange-400 text-white w-full py-2 rounded-md text-lg font-semibold hover:bg-orange-500 transition"
                >
                  Add Student
                </button>
              </form>

              {popupMessage && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
                  <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md relative">
                    <svg
                      className="h-6 w-6 text-red-500 absolute top-4 right-4 cursor-pointer"
                      onClick={() => setPopupMessage(null)}
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <p className="text-lg font-bold mt-4 text-green-700 text-center">
                      {popupMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeacherAddStudent;
