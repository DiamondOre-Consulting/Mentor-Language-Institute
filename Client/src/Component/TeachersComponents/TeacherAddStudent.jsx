import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { getToastVariant } from "../../utils/toastVariant";
import {
  normalizeDigits,
  validateEmail,
  validatePhone,
  validateRequired,
} from "../../utils/validators";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const TeacherAddStudent = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { get, post } = useApi();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [courseId, setCourseId] = useState(""); // Added courseId
  const [popupMessage, setPopupMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toastVariant = getToastVariant(popupMessage);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };



  useEffect(() => {
    const fetchAllCourses = async () => {
      setLoading(true);
      try {
        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await get({
          url: "/teachers/my-classes",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

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
    const nextErrors = {
      userName: validateRequired(userName, "Username"),
      name: validateRequired(name, "Name"),
      phone: validatePhone(phone),
      email: validateEmail(email),
      dob: validateRequired(dob, "Date of birth"),
      grade: validateRequired(grade, "Grade"),
      password: validateRequired(password, "Password"),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setLoading(false);
      return;
    }

    try {
      const response = await post({
        url: "/teachers/add-student",
        data: {
          name,
          phone,
          password,
          userName,
          email,
          dob,
          courseId,
          grade,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Student Added Successfully");
        setName("");
        setPhone("");
        setPassword("");
        setDob("");
        setUserName("");
        setEmail("");
        setCourseId("");
        setGrade("");
      } else if (response.status === 409 || response.status === 400) {
        setPopupMessage(response?.data?.message || "Student already exists.");
      } else {
        setPopupMessage("Error in Adding Student");
      }
    } catch (error) {
      if (error.response) {
        setPopupMessage(
          error.response?.data?.message || "Student already exists."
        );
      } else {
        setPopupMessage("Error in Adding Student");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  min-h-screen flex items-center justify-center px-4 py-8 bg-white">
      <section className="relative w-full mt-10">
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserName(value);
                      setErrors((prev) => ({
                        ...prev,
                        userName: validateRequired(value, "Username"),
                      }));
                    }}
                    placeholder="Please Enter a unique userName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                  {errors.userName && (
                    <p className="mt-1 text-xs text-rose-600">{errors.userName}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setName(value);
                      setErrors((prev) => ({
                        ...prev,
                        name: validateRequired(value, "Name"),
                      }));
                    }}
                    placeholder="Enter Student Name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const value = normalizeDigits(e.target.value).slice(0, 10);
                      setPhone(value);
                      setErrors((prev) => ({
                        ...prev,
                        phone: validatePhone(value),
                      }));
                    }}
                    placeholder="Enter Phone No"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);
                      setErrors((prev) => ({
                        ...prev,
                        email: validateEmail(value),
                      }));
                    }}
                    placeholder="Enter email address"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDob(value);
                      setErrors((prev) => ({
                        ...prev,
                        dob: validateRequired(value, "Date of birth"),
                      }));
                    }}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                  {errors.dob && (
                    <p className="mt-1 text-xs text-rose-600">{errors.dob}</p>
                  )}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setGrade(value);
                      setErrors((prev) => ({
                        ...prev,
                        grade: validateRequired(value, "Grade"),
                      }));
                    }}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                  {errors.grade && (
                    <p className="mt-1 text-xs text-rose-600">{errors.grade}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
                      setErrors((prev) => ({
                        ...prev,
                        password: validateRequired(value, "Password"),
                      }));
                    }}
                    placeholder="********"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                  )}
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
                <div className="app-toast-overlay">
                  <div className={`app-toast-card app-toast-${toastVariant} relative`}>
                    <button
                      type="button"
                      className="app-toast-close"
                      onClick={() => setPopupMessage(null)}
                      aria-label="Close notification"
                    >
                      <svg
                        className="h-4 w-4"
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
                    </button>
                    <p className="pt-2 text-center text-sm font-semibold">
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


