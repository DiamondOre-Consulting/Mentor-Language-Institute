import React, { useEffect, useState } from "react";
import { Tabs } from "flowbite-react";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useJwt } from "react-jwt";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Register = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  // console.log(token)
  // admin
  const [formValues, setFormValues] = useState({
    classTitle: "",
    // classSchedule: "",
    teachBy: "",
    totalHours: "",
  });

  // const [selectedDays, setSelectedDays] = useState({
  //     Mon: false,
  //     Tue: false,
  //     Wed: false,
  //     Thu: false,
  //     Fri: false,
  //     Sat: false,
  //     Sun: false,
  // });

  // const handleCheckboxChange = (event) => {
  //     const { name, checked } = event.target;
  //     setSelectedDays({ ...selectedDays, [name]: checked });
  // };

  const navigate = useNavigate();

  const handleAddCourse = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }

      // let classScheduleString = '';

      // Object.entries(selectedDays).forEach(([day, isChecked]) => {
      //     if (isChecked) {
      //         classScheduleString += day.substring(0, 3) + ' ';
      //     }
      // });

      const formData = {
        classTitle: formValues.classTitle,
        teachBy: formValues.teachBy,
        totalHours: formValues.totalHours,
        // classSchedule: classScheduleString.trim(), // Ensure the schedule is trimmed
      };

      const response = await axios.post(
        "http://localhost:7000/api/admin-confi/add-new-class",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // console.log("New course has been added");
        setPopupMessage("New Course Has Been Added");
        setFormValues({
          classTitle: "",
          teachBy: "",
          totalHours: "",
        });
        // setSelectedDays({
        //     Mon: false,
        //     Tue: false,
        //     Wed: false,
        //     Thu: false,
        //     Fri: false,
        //     Sat: false,
        //     Sun: false,
        // });
      } else if (response.status === 404) {
        // console.log("Admin not found");
        setPopupMessage("Admin not found");
      } else {
        // console.log("Error adding course:", response.status);
        setPopupMessage("Error adding course");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          setPopupMessage("Admin not found");
        } else {
          console.error("Error adding course:", status);
          setPopupMessage("Error adding course");
        }
      } else {
        console.error("Error adding course:", error.message);
        setPopupMessage("Error adding course");
      }
    } finally {
      setLoading(false);
    }
  };

  // fetch teacher data
  const [allTeachers, setAllTeachers] = useState([]);

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
          "http://localhost:7000/api/admin-confi/all-teachers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status == 200) {
          // console.log(response.data);
          const allteachers = response.data;
          // console.log(allteachers);
          setAllTeachers(allteachers);
        }
      } catch (error) {
        console.error("Error fetching associates:", error);
      }
    };

    fetchAllTeachers();
  }, []);

  //teacher

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setdob] = useState();
  const [userName, setUserName] = useState("");
  const [popupMessage, setPopupMessage] = useState(null);

  const handleteacherRegister = async (e) => {
    setLoading(true);
    e.preventDefault();
    setPopupMessage(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }

      if (!name || !phone || !password || !dob) {
        setPopupMessage("All field are required");
        return;
      }

      const response = await axios.post(
        "http://localhost:7000/api/admin-confi/add-teacher",
        {
          name,
          phone,
          password,
          dob,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPopupMessage("Teacher registered successfully");
        setName("");
        setPhone("");
        setPassword("");
      } else if (response.status === 409) {
        setPopupMessage("Teacher already registered");
      } else {
        setPopupMessage("Error registering teacher");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          setPopupMessage("Teacher already registered");
        } else {
          setPopupMessage("Error registering teacher");
        }
      } else {
        setPopupMessage("Error registering teacher");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // register students

  const handleStudentRegister = async (e) => {
    setLoading(true);
    e.preventDefault();
    setPopupMessage(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }
      if (!name || !phone || !password || !dob || !userName) {
        setPopupMessage("All field are required");
        return;
      }

      const response = await axios.post(
        "http://localhost:7000/api/admin-confi/add-student",
        {
          name,
          phone,
          password,
          userName,
          dob,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPopupMessage("Student Registered Successfully");
        setName("");
        setPhone("");
        setPassword("");
      } else if (response.status === 409) {
        setPopupMessage("Student Already Registered");
      } else {
        setPopupMessage("Error Registering Student");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          setPopupMessage("Student Already Registered");
        } else {
          setPopupMessage("Error Registering Student");
        }
      } else {
        setPopupMessage("Error Registering Student");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <ClipLoader
            color={"#FFA500"}
            loading={loading}
            css={override}
            size={70}
          />
        </div>
      )}
      <div className="flex flex-col items-center justify-center">
        <div className="flex space-x-2 md:space-x-4">
          <button
            className={`py-2 px-0 md:px-4 border-b-2 ${activeTab === 0 ? "border-orange-500" : "border-transparent"
              } focus:outline-none`}
            onClick={() => handleTabClick(0)}
          >
            Register Student
          </button>
          <button
            className={`py-2 px-0 md:px-4 border-b-2 ${activeTab === 1 ? "border-orange-500" : "border-transparent"
              } focus:outline-none`}
            onClick={() => handleTabClick(1)}
          >
            Register Teacher
          </button>
          <button
            className={`py-2 px-0 md:px-4 border-b-2 ${activeTab === 2 ? "border-orange-500" : "border-transparent"
              } focus:outline-none`}
            onClick={() => handleTabClick(2)}
          >
            Add New Courses
          </button>
        </div>
        <div className="py-4">
          {activeTab === 0 && (
            <section className="w-full">
              <div className="flex flex-col items-center justify-center w-full px-6 py-8">
                <div className="w-full max-w-screen-xl bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                  <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl md:mx-20">
                      Register Student
                    </h1>
                    <div className=" md:w-22 h-0.5 bg-orange-500 border-rounded"></div>
                    <form
                      className="space-y-4 md:space-y-6"
                      onSubmit={handleStudentRegister}
                    >
                      <div>
                        <label className="block w-full mb-2 text-sm font-medium text-gray-900">
                          Username
                        </label>
                        <input
                          type="text"
                          name="userName"
                          id="userName"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Please Enter a unique userName"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                          required=""
                        />
                      </div>
                      <div>
                        <label className="block w-full mb-2 text-sm font-medium text-gray-900">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                          placeholder="Enter Student Name"
                          required=""
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Phone
                        </label>
                        <input
                          type="phone"
                          name="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter Phone No"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          required=""
                        />
                      </div>
                      <div className="">
                        <label
                          className="block mb-2 text-sm font-medium text-gray-900 "
                          htmlFor="dob"
                        >
                          Date of Birth:
                        </label>
                        <input
                          type="date"
                          id="dob"
                          value={dob}
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 rounded-lg outline-none  focus:ring-0"
                          onChange={(e) => setdob(e.target.value)} // Capture the date input
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          required=""
                        />
                      </div>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          className="mr-2"
                          onChange={() => setShowPassword(!showPassword)}
                        />
                        <label
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          Show Password
                        </label>
                      </div>

                      <button className="w-full py-2 text-white bg-orange-400 rounded-md">
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeTab === 1 && (
            <section className="w-full">
              <div className="flex flex-col items-center justify-center w-full px-6 py-8">
                <div className="w-full max-w-screen-xl bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                  <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl md:mx-20">
                      Register Teacher
                    </h1>
                    <div className="w-22 h-0.5 bg-orange-500 border-rounded"></div>
                    <form
                      className="space-y-4 md:space-y-6"
                      action="#"
                      onSubmit={handleteacherRegister}
                    >
                      <div>
                        <label className="block w-full mb-2 text-sm font-medium text-gray-900">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          placeholder="Enter Teacher Name"
                          required=""
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Phone
                        </label>
                        <input
                          type="phone"
                          name="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter Phone No"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          required=""
                        />
                      </div>
                      <div className="">
                        <label
                          className="block mb-2 text-sm font-medium text-gray-900 "
                          htmlFor="dob"
                        >
                          Date of Birth:
                        </label>
                        <input
                          type="date"
                          id="dob"
                          value={dob}
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 rounded-lg outline-none  focus:ring-0"
                          onChange={(e) => setdob(e.target.value)} // Capture the date input
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      "
                          required=""
                        />
                      </div>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          className="mr-2"
                          onChange={() => setShowPassword(!showPassword)}
                        />
                        <label
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          Show Password
                        </label>
                      </div>

                      <button className="w-full py-2 text-white bg-orange-400 rounded-md">
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeTab === 2 && (
            <section className="w-full">
              <div className="flex flex-col items-center justify-center w-full px-6 py-8">
                <div className="w-full max-w-screen-xl bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                  <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl md:mx-20">
                      Add New Course
                    </h1>
                    <div className="w-22 h-0.5 bg-orange-500 border-rounded"></div>
                    <form
                      className="space-y-4 md:space-y-6"
                      action="#"
                      onSubmit={handleAddCourse}
                    >
                      <div>
                        <label
                          htmlFor="classTitle"
                          className="block w-full mb-2 text-sm font-medium text-gray-900"
                        >
                          Class Title
                        </label>
                        <input
                          type="text"
                          name="classTitle"
                          onChange={handleInputChange}
                          value={formValues.classTitle}
                          className=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5      "
                          placeholder="Enter Course Title"
                          required=""
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Total Hours
                        </label>
                        <input
                          type="text"
                          name="totalHours"
                          onChange={handleInputChange}
                          value={formValues.totalHours}
                          placeholder="Enter Total Hours"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5      "
                          required=""
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Teach By
                        </label>
                        <select
                          id="teachBy"
                          name="teachBy"
                          value={formValues.teachBy}
                          onChange={(e) =>
                            setFormValues({
                              ...formValues,
                              teachBy: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-gray-800 transition duration-100 border rounded outline-none ring-gray-700 focus:ring"
                        >
                          <option value="">Select Teacher</option>
                          {allTeachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.UniqueCode
                                ? `${teacher.UniqueCode}`
                                : `${teacher.name}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900 ">Schedule</label>
                                                <ul className="flex flex-wrap items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex sm:">

                                                    {Object.entries(selectedDays).map(([day, isChecked]) => (
                                                        <li
                                                            key={day}
                                                            class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r "
                                                        >
                                                            <div class="flex items-center ps-3">
                                                                <input
                                                                    id={`${day}-checkbox-list`}
                                                                    type="checkbox"
                                                                    name={day}
                                                                    checked={isChecked}
                                                                    onChange={handleCheckboxChange}
                                                                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500    focus:ring-2  -gray-500"
                                                                />
                                                                <label
                                                                    for={`${day}-checkbox-list`}
                                                                    class="w-full py-3 ms-2 text-sm font-medium text-gray-900 "
                                                                >
                                                                    {day}
                                                                </label>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div> */}

                      <button className="w-full py-2 text-white bg-orange-400 rounded-md">
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {popupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <svg
              className="float-right w-6 h-6 -mt-2 text-red-500 cursor-pointer"
              onClick={() => setPopupMessage(null)}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {" "}
              <path stroke="none" d="M0 0h24v24H0z" />{" "}
              <line x1="18" y1="6" x2="6" y2="18" />{" "}
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <p className="mt-4 text-lg font-bold text-green-700">
              {popupMessage}
            </p>
            {/* <button className="px-4 py-2 text-white bg-orange-500 rounded-md" onClick={() => setPopupMessage(null)}>Close</button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
