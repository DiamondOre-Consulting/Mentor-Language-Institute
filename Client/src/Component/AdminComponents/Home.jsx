import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import adminhome1 from "..//../assets/adminhome1.jpg";
import adminhome2 from "..//../assets/adminhome2.jpg";
import adminhome3 from "..//../assets/adminhome3.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    phone: "",
    password: "",
  });

  // Fetch all students
  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/admin-login");
          return;
        }

        const response = await axios.get(
          "https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/all-students",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          // console.log(response.data);
          setAllStudents(response.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchAllStudents();
  }, [navigate]);

  // Fetch all courses
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/all-classes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          // console.log(response.data);
          setAllCourses(response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchAllCourses();
  }, [navigate]);

  // Fetch all teachers
  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/admin-login");
          return;
        }

        const response = await axios.get(
          "https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/all-teachers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          // console.log(response.data);
          setAllTeachers(response.data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchAllTeachers();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/signup-admin",
        formData
      );

      if (response.status == 201) {
        console.log(response);
        setPopupMessage("New Admin Has Been Created Successfully!");
        console.log("admin signup", response);
        setIsFormOpen(false);
        setFormData({ name: "", branch: "", phone: "", password: "" });
        setUserName(response.data.newAdmin.username); // Assuming the username is returned in response.data.username
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status == 409) {
          setPopupMessage("Admin Already Exists");
        }
      }
    }
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  return (
    <>
      <div>
        <button
          onClick={openForm}
          className="bg-orange-400 rounded-md text-gray-50 p-2 float-right"
        >
          Add Admin
        </button>
        <h1 className="text-3xl font-semibold mb-10 text-gray-600">
          <span className="text-4xl">Welcome !! </span>
          <br></br>
          <span className="text-orange-500 font-bold">Admin</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow">
              <a href="#">
                <img className="rounded-t-lg" src={adminhome1} alt="" />
              </a>
              <div className="p-5">
                <a href="#">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                    All Students
                  </h5>
                </a>
                <p className="mb-3 font-normal text-gray-700">
                  Total students: {allStudents.length}
                </p>
                <Link
                  to="/admin-dashboard/allstudents"
                  className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-blue-300"
                >
                  Explore More
                  <svg
                    className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div>
            <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow">
              <a href="#">
                <img className="rounded-t-lg" src={adminhome2} alt="" />
              </a>
              <div className="p-5">
                <a href="#">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                    All Teachers
                  </h5>
                </a>
                <p className="mb-3 font-normal text-gray-700">
                  Total Teachers: {allTeachers.length}
                </p>
                <Link
                  to="/admin-dashboard/allteachers"
                  className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-blue-300"
                >
                  Explore More
                  <svg
                    className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div>
            <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow">
              <a href="#">
                <img className="rounded-t-lg" src={adminhome3} alt="" />
              </a>
              <div className="p-5">
                <a href="#">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                    All Courses
                  </h5>
                </a>
                <p className="mb-3 font-normal text-gray-700">
                  Total Courses: {allCourses.length}
                </p>
                <Link
                  to="/admin-dashboard/allcourses"
                  className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-blue-300"
                >
                  Explore More
                  <svg
                    className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white shadow-md rounded-md p-6 w-3/4 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Admin</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 p-2 border border-gray-500 rounded-md w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 p-2 border border-gray-500 rounded-md w-full"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="branch"
                  className="block text-sm font-medium text-gray-700"
                >
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-500 rounded-md"
                >
                  <option>Select Branch</option>
                  <option value="Noida-107">Noida-107</option>
                  <option value="Noida-51">Noida-51</option>
                  <option value="East Delhi">East Delhi</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 p-2 border border-gray-500 rounded-md w-full"
                  required
                  autoComplete="off"
                />
              </div>

              <div class="flex items-center mt-2">
                <input
                  type="checkbox"
                  class="mr-2"
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label
                  class="text-sm font-medium text-gray-900  cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  Show Password
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-2"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {popupMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
          <div className="bg-white shadow-md rounded-md p-6">
            <p className="text-lg font-semibold">{popupMessage}</p>
            {userName && (
              <>
                <p className="mt-2">
                  Your UserName is{" "}
                  <span className="font-bold text-xl"> {userName}</span>
                </p>
                <span className="text-red-800 ">
                  Please write down this username somewhere!!
                </span>
                <br></br>
              </>
            )}
            <button
              onClick={() => setPopupMessage("")}
              className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 mt-2 float-right"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
