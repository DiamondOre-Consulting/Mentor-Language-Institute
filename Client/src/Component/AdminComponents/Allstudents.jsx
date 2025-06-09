import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Allstudents = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [status, setStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [setuId, setStuId] = useState(null);
  const [stuname, setStuName] = useState("");
  const [isEditableFormOpen, setIsEditableFormOpen] = useState(false);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [formData, setFormData] = useState({
    totalFee: "",
    feeMonth: "",
    paid: "",
    amountPaid: "",
  });
  // all students

  useEffect(() => {
    const fetchAllStudents = async () => {
      setLoading(true);
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
        if (response.status == 200) {
          // console.log("all students",response.data);
          const allstudents = response.data;
          // console.log(allstudents);
          setAllStudents(allstudents);
        }
      } catch (error) {
        console.error("Error fetching associates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, []);

  // all courses
  useEffect(() => {
    const fetchAllcourses = async () => {
      try {
        setLoading(true);
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
        if (response.status == 200) {
          // console.log(response.data);
          const allcourses = response.data;
          // console.log(allcourses);
          setAllCourses(allcourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllcourses();
  }, []);

  // Filter students based on search query
  const filteredStudents = allStudents.filter((student) =>
    student.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const openForm = (studentId) => {
    // console.log("Clicked Accept for student ID:", studentId);
    setSelectedStudentId(studentId);
    setIsFormOpen(true);
  };

  const openPopup = (studentId, studentName) => {
    setStuId(studentId);
    setStuName(studentName);
    setShowPopup(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const monthNameToNumber = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        // console.error("No token found");
        return;
      }

      const { totalFee, feeMonth, paid, amountPaid } = formData;
      // const lowerCaseFeeMonth = feeMonth.toLowerCase();
      const monthNumber = monthNameToNumber[feeMonth];

      const response = await axios.put(
        `https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/enroll-student/${selectedCourseId}/${selectedStudentId}`,
        {
          totalFee,
          feeMonth: monthNumber,
          paid,
          amountPaid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // console.log(response.data.message);
        setPopupMessage("Successfully Enrolled!");
        setIsFormOpen(false);
      } else if (response.status === 409) {
        // console.log("Student already registered!");
        setPopupMessage("Student already Enrolled!");
        setIsFormOpen(false);
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          // console.log("Student already registered!");
          setPopupMessage("Student already Enrolled!");
          setIsFormOpen(false);
        } else {
          console.error("Error login teacher:", status);
          setError("Login Details Are Wrong!!");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setSelectedStudentId("");
    setIsFormOpen(false);
  };

  //  DETATIVE STUDENT ACCOUNT BY ADMIN
  // console.log(setuId)
  // console.log(status)
  const detailsctiveaccount = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // console.error("No token found");
        navigate("/login");
        return;
      }

      const deactiveResponse = await axios.put(
        `https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/deactivate-account/${setuId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (deactiveResponse.status === 201) {
        // console.log("Account has been deactivated");
        window.location.reload();
        setShowPopup(false);
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
    }
  };

  // const deleteSudentId = (studentId) => {
  //   setStuId(studentId);
  //   deleteStudent();
  // };

  const deleteStudent = async (id) => {
    // e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/delete-student/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert("Student Deleted Successfully");
        window.location.reload();
      }
    } catch (error) {
      console.log("");
    }
  };
  return (
    <>
      <h1 className="mb-1 text-4xl font-semibold text-center">All Students</h1>
      <div className="h-1 mx-auto mb-8 text-center bg-orange-500 rounded w-44"></div>
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

      {/* Search bar */}
      <div className="flex justify-end mb-4 mr-4">
        <input
          type="text"
          placeholder="Search student..."
          className="w-full px-2 py-2 border border-gray-400 rounded"
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 shadow-3xl">
        {filteredStudents.map((student) => (
          <>
            <div
              className={`block w-full p-4 ${
                student.deactivated
                  ? "bg-red-300 text-red-300 hover:text-red-400 hover:bg-red-400"
                  : "bg-white hover:bg-gray-100"
              }border border-gray-200 rounded-lg shadow     cursor-pointer`}
            >
              <div className="flex justify-between items-cetner">
                {" "}
                <h5 className="text-xl font-bold tracking-tight text-gray-900 ">
                  {student.name}
                </h5>{" "}
                <span className="text-xs text-sm text-gray-100 rounded-md">
                  <svg
                    onClick={() => openPopup(student._id, student.name)}
                    className="w-6 h-6 text-red-500"
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
                    <line x1="4" y1="7" x2="20" y2="7" />{" "}
                    <line x1="10" y1="11" x2="10" y2="17" />{" "}
                    <line x1="14" y1="11" x2="14" y2="17" />{" "}
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />{" "}
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </span>
              </div>

              <p className="text-sm font-normal text-gray-700 ">
                phone :- <span>{student.phone}</span>
              </p>
              <div className="flex justify-between  items-center mt-4">
                <span
                  className="px-2 py-1 text-sm text-gray-100 bg-green-400 rounded-md"
                  onClick={() => openForm(student._id)}
                >
                  Enroll{" "}
                </span>

                <span
                  className="bg-red-500 p-2 text-[12px] text-gray-100 rounded-md"
                  onClick={() => {
                    deleteStudent(student?._id);
                  }}
                >
                  Delete Student
                </span>
                <Link
                  key={student._id}
                  to={`/admin-dashboard/student/${student?._id}`}
                  className="px-2 py-1 text-sm text-blue-500 underline rounded-md "
                >
                  <button className="bg-blue-500 p-2 text-[12px] text-gray-100 rounded-md">
                    Edit Student
                  </button>
                </Link>
                <Link
                  key={student._id}
                  to={`/admin-dashboard/allstudents/${student?._id}`}
                  className="px-2 py-1 text-sm text-blue-500 underline rounded-md "
                >
                  View
                </Link>
              </div>
              {/* <span className='flex justify-center justify-end px-1 py-1 mt-4 mb-1 text-center text-gray-100 bg-orange-500 rounded-full'>
              Deactivate Account
            </span> */}
            </div>
          </>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-3/4 max-w-md p-6 bg-white rounded-md shadow-md">
            <h2 className="mb-4 text-lg font-semibold">Enroll Student</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="courses"
                  className="block text-sm font-medium text-gray-700"
                >
                  All Courses
                </label>
                <select
                  className="w-full"
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  value={selectedCourseId}
                  required
                >
                  <option value="">Select Course</option>
                  {allCourses.map((course, index) => (
                    <option key={index} value={course._id}>
                      {course.classTitle}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="totalFee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Total Fee:
                </label>
                <input
                  type="text"
                  id="totalFee"
                  name="totalFee"
                  value={formData.totalFee}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border border-gray-500 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="feeMonth"
                  className="block text-sm font-medium text-gray-700"
                >
                  Fee Month:
                </label>
                <select
                  className="w-full"
                  onChange={(e) =>
                    setFormData({ ...formData, feeMonth: e.target.value })
                  } // Update the formData state
                  value={formData.feeMonth} // Set the selected value to the formData state
                  required
                >
                  <option value="">Select Month</option>
                  {months.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="paid"
                  className="block text-sm font-medium text-gray-700"
                >
                  Paid:
                </label>
                <select
                  value={formData.paid}
                  onChange={(e) =>
                    setFormData({ ...formData, paid: e.target.value })
                  }
                  className="w-full"
                >
                  <option>Select Status</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="amountPaid"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount Paid:
                </label>
                <input
                  type="text"
                  id="amountPaid"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border border-gray-500 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 mr-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-orange-400 rounded-md hover:bg-orange-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-3/4 max-w-md p-6 bg-white rounded-md shadow-md">
            <h2 className="mb-4 text-lg font-semibold">{stuname}</h2>
            <form onSubmit={detailsctiveaccount}>
              <div className="mb-4">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full"
                >
                  <option>Select Status</option>
                  <option value="false">Activate Account</option>
                  <option value="true">Deactivate Account</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 mr-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-orange-400 rounded-md hover:bg-orange-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {popupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="p-6 bg-white rounded-md shadow-md">
            <p className="text-lg font-semibold">{popupMessage}</p>
            <button
              onClick={() => setPopupMessage("")}
              className="px-4 py-2 mt-4 text-white bg-orange-400 rounded-md hover:bg-orange-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Allstudents;
