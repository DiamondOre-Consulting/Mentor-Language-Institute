import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Select } from "flowbite-react";
import { decodeToken } from "react-jwt";
import { useJwt } from "react-jwt";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import userimg2 from "..//..//assets/userimg2.png";
import { toast } from "sonner";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const TeacherAllStudentEachCourse = () => {
  const navigate = useNavigate();
  const { selectedClassId } = useParams();
  const [allDetails, setAllDetails] = useState([]);
  const [courseDetails, setCourseDetails] = useState([]);
  const [attendanceDetailsMap, setAttendanceDetailsMap] = useState({});
  const [studentId, setStudentId] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [numberOfClasses, setNumberOfClasses] = useState("");
  const [selectedstudentId, setSelectedStudentId] = useState(null);
  const [numberOfClassesTaken, setNumberOfClassesTaken] = useState("");
  const [studentDetails, setStudentsDetails] = useState([]);
  const [myenrolledStudentDetails, setMyEnrolledStudentsDetails] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [monthCommissionDetails, setMonthlyCommissionDetails] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [editingCommissionId, setEditingCommissionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [monthlyClassTaken, setMonthlyClassTaken] = useState("");
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
  const years = [
    "2024",
    "2025",
    "2026",
    "2027",
    "2028",
    "2029",
    "2030",
    "2031",
    "2032",
  ];

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/my-classes/${selectedClassId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const courseData = response.data;
          setCourseDetails(response.data);
          setStudentId(courseData.enrolledStudents);
          const enrolledStudents = courseData.enrolledStudents;
          const enrolledStudentsDetails = [];

          for (const studentIds of enrolledStudents) {
            const studentResponse = await axios.get(
              `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/student/${studentIds}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (studentResponse.status === 200) {
              const studentData = studentResponse.data;
              enrolledStudentsDetails.push(studentData);
              setMyEnrolledStudentsDetails(enrolledStudentsDetails);
              setLoading(false);
            }
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [selectedClassId, navigate]);

  // fetch attendence details
  const fetchAttendanceDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      // setLoading(true);
      if (!token) {
        console.error("Token not found");
        return;
      }

      const attendanceResponse = await axios.get(
        `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/attendance/${selectedClassId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            attendanceDate: selectedDate, // Pass attendanceDate as a query parameter
          },
        }
      );

      if (attendanceResponse.status === 200) {
        const mapping = attendanceResponse.data
          .filter((item) => item.detailAttendance)
          .map((item) => item.detailAttendance);

        const numberOfClassesTakenValues = mapping.map((detailAttendance) =>
          detailAttendance.map((detail) => detail.numberOfClassesTaken)
        );
        setAttendanceDetails(attendanceResponse.data);

        const studentIds = attendanceResponse.data.map(
          (item) => item.studentId
        );
        const studentData = [];
        for (const studentid of studentIds) {
          const studentResponse = await axios.get(
            `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/student/${studentid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (studentResponse.status === 200) {
            const data = studentResponse.data;
            studentData.push(data);
          }
        }
        setStudentsDetails(studentData);

        setAttendanceDetailsMap({});
      }
    } catch (error) {
    }
  };
  useEffect(() => {
    // Call fetchAttendanceDetails when selectedDate or selectedClassId changes
    fetchAttendanceDetails();
  }, [selectedDate, selectedClassId]);

  const handleFetchStudentDetails = (studentId, studentName) => {
    setSelectedStudentName(studentName);
    setSelectedStudentId(studentId);

    setNumberOfClassesTaken(
      attendanceDetailsMap[studentId]?.numberOfClassesTaken || 0
    );
    setShowPopup(true);
  };

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    const selectedDateObj = courseDetails.dailyClasses.find(
      (date) => date.classDate === selectedDate
    );
    if (selectedDateObj) {
      setSelectedDate(selectedDate);
      setNumberOfClasses(selectedDateObj.numberOfClasses);
    }
  };

  // update atendence

  const updateAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
      }
      if (!selectedDate) {
        alert("Please select a date first.");
        return;
      }

      const response = await axios.put(
        `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/update-attendance/${selectedClassId}/${selectedstudentId}`,
        {
          attendanceDate: selectedDate,
          numberOfClassesTaken,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setShowPopup(false);
        setSelectedMonth("");
        setSelectedYear("");
        setAttendanceDetailsMap((prevAttendanceDetailsMap) => ({
          ...prevAttendanceDetailsMap,
          [selectedstudentId]: numberOfClassesTaken,
        }));
        await getMonthlyCommission();
        await fetchAttendanceDetails();
        // handleFetchStudentDetails()
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setSelectedMonth("");
      setSelectedYear("");
    }
  };

  const getMonthlyCommission = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // const commission = [];

      const monthlyCommissionReport = await axios.get(
        `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/my-commission/${selectedClassId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (monthlyCommissionReport.status === 200) {
        setMonthlyCommissionDetails(monthlyCommissionReport.data);
      }
    } catch (error) {
      console.log("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMonthlyCommission();
  }, [selectedClassId]);

  // update monthly commission
  const updateMonthlyCommission = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
      }
      if (!selectedMonth || !selectedYear) {
        alert("Please fill in all fields.");
        return;
      }

      let response;

      if (editingCommissionId) {
        // Update existing
        response = await axios.put(
          `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/edit-monthly-classes/${editingCommissionId}`,
          {
            monthName: selectedMonth,
            year: selectedYear,
            classesTaken: monthlyClassTaken,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Add new
        response = await axios.post(
          `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/add-monthly-classes/${selectedClassId}`,
          {
            monthName: selectedMonth,
            year: selectedYear,
            classesTaken: monthlyClassTaken,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.status === 200) {
        toast.success(
          editingCommissionId ? "Commission updated." : "Commission added."
        );
        setSelectedMonth("");
        setSelectedYear("");
        setMonthlyClassTaken("");
        setEditingCommissionId(null);
        getMonthlyCommission(); // refresh
      }
    } catch (error) {
      console.error("Error in updateMonthlyCommission", error);
    } finally {
      setLoading(false);
    }
  };

  const [studentList, setStudentList] = useState([]);
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentList = await axios.get(
          `https://mentor-backend-rbac6.ondigitalocean.app/api/admin-confi/get-studentsListBySub/${selectedClassId}`
        );

        if (studentList?.data?.success) {
          setStudentList(studentList?.data?.enrolledStudents);
        }
      } catch (error) {
        console.log("");
      }
    };
    fetchStudentData();
  }, []);

  const handleEditCommission = (commission) => {
    setSelectedMonth(commission.monthName);
    setSelectedYear(commission.year);
    setMonthlyClassTaken(commission.classesTaken);
    setEditingCommissionId(commission._id);
  };

  const handleDeleteCommission = async (commissionId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/delete-monthly-classes/${commissionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Deleted successfully.");
        getMonthlyCommission();
      }
    } catch (error) {
      console.log("Error deleting commission", error);
    }
  };

  return (
    <div className="p-4">
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
      <h1 className="mt-10 mb-1 text-4xl font-semibold text-gray-700 text-start md:mt-0">
        {courseDetails.classTitle} | Total Hours: {courseDetails.totalHours}
      </h1>

      <div className="relative mt-8 overflow-x-auto">
        {/* <div class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white ">

                    <label for="table-search" class="sr-only">Search</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="text" id="table-search-users" class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500      " placeholder="Search for users" />
                    </div>
                </div> */}
        <div className="flex items-center ">
          <div>
            <select onChange={handleDateChange}>
              <option>Select Date</option>
              {courseDetails.dailyClasses &&
                courseDetails.dailyClasses.map((date) => {
                  return <option key={date._id}>{date.classDate}</option>;
                })}
            </select>
          </div>
          <div className="ml-6">
            {selectedDate && (
              <div className="ml-4">
                <div
                  className="px-12 py-2 bg-gray-100 border border-2 rounded-md"
                  value={numberOfClasses}
                >
                  <span>{numberOfClasses}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 mt-10 md:grid-cols-1">
          <table className="w-full text-sm text-center text-gray-500 shadow-xl rtl:text-right">
            <thead className="text-xs text-gray-100 uppercase bg-orange-500 ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Classes Taken
                </th>
                <th scope="col" className="px-6 py-3">
                  Commission
                </th>
              </tr>
            </thead>
            <tbody>
              {studentDetails.map((student, index) => {
                // Find the attendance details for the current student
                const studentAttendanceDetails = attendanceDetails.find(
                  (attendance) => attendance.studentId === student._id
                );
                const studentTotalClassesTaken = studentAttendanceDetails
                  ? studentAttendanceDetails.detailAttendance
                      .filter((detail) => detail.classDate === selectedDate) // Filter by selected date
                      .reduce(
                        (total, detail) =>
                          total + (+detail.numberOfClassesTaken || 0),
                        0
                      )
                  : 0;
                const showEditIcon = studentTotalClassesTaken === 0;

                const teachercommission = studentAttendanceDetails
                  ? studentAttendanceDetails.detailAttendance
                      .filter((details) => details.classDate === selectedDate)
                      .reduce(
                        (totalCommission, detail) =>
                          totalCommission + detail.commission,
                        0
                      )
                  : 0;

                return (
                  <tr key={student._id} className="bg-white border-b ">
                    <th
                      scope="row"
                      className="flex items-center py-4 pl-6 text-gray-900 pr-14 md:pl-6 md:pr-6 whitespace-nowrap bg-orange-50"
                    >
                      <img
                        className="w-6 h-6 rounded-full md:w-10 md:h-10"
                        src={userimg2}
                        alt="Jese image"
                      />
                      <div className="ps-3">
                        <div className="text-base font-semibold">
                          {student.name}
                        </div>
                        <div className="font-normal text-gray-500">
                          {student.phone}
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4 text-center cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center justify-center">
                        {showEditIcon ? (
                          <svg
                            onClick={() =>
                              handleFetchStudentDetails(
                                student._id,
                                student.name
                              )
                            }
                            className="w-6 h-6 text-red-600"
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
                            <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />{" "}
                            <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
                          </svg>
                        ) : (
                          <div className="flex space-x-4 items-center ">
                            {studentTotalClassesTaken}

                            <svg
                              onClick={() =>
                                handleFetchStudentDetails(
                                  student._id,
                                  student.name
                                )
                              }
                              className="w-6 h-6 text-red-600 ml-4"
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
                              <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />{" "}
                              <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {teachercommission}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h1 className="mt-4 text-3xl ">Monthly Commission</h1>

          <table className="w-full text-sm text-center text-gray-500 rounded-md shadow-xl rtl:text-center">
            <thead className="text-xs text-gray-100 uppercase bg-orange-500 rounded-md ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Month
                </th>
                <th scope="col" className="px-6 py-3">
                  Year
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Classes Taken
                </th> */}
                <th scope="col" className="px-6 py-3">
                  commission
                </th>

                <th scope="col" className="px-6 py-3">
                  Paid
                </th>

                <th scope="col" className="px-6 py-3">
                  Remarks(if any)
                </th>

                <th scope="col" className="px-6 py-3">
                  action
                </th>

                <th scope="col" className="px-6 py-3">
                  submit
                </th>
              </tr>
            </thead>
            <tbody>
              {monthCommissionDetails &&
                monthCommissionDetails.map((commission, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-center">
                      {editingCommissionId === commission._id ? (
                        <select
                          className="border px-2 py-1 rounded"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                          {months.map((month, idx) => (
                            <option key={idx} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      ) : (
                        commission.monthName
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingCommissionId === commission._id ? (
                        <select
                          className="border px-2 py-1 rounded"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                          {years.map((year, idx) => (
                            <option key={idx} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      ) : (
                        commission.year
                      )}
                    </td>
                    {/* <td className="px-6 py-4 text-center">
                      {commission.classesTaken}
                    </td> */}
                    <td className="px-6 py-4 text-center">
                      {commission.commission}
                    </td>
                    <td
                      className={`px-6 py-4 text-center ${
                        commission.paid
                          ? "text-green-500 font-bold"
                          : "text-red-400"
                      }`}
                    >
                      {commission.paid ? "paid" : "Unpaid"}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {commission.remarks}
                    </td>
                    <td className="px-6 flex gap-x-2 items-center justify-center py-4 text-center underline text-red-500">
                      <p
                        onClick={() => handleEditCommission(commission)}
                        className="cursor-pointer hover:text-orange-600"
                      >
                        Edit
                      </p>

                      <p
                        onClick={() => handleDeleteCommission(commission._id)}
                        className="cursor-pointer hover:text-orange-600"
                      >
                        Delete
                      </p>
                    </td>

                    {editingCommissionId === commission._id && (
                      <td className="px-2 py-4 text-center">
                        <button
                          onClick={updateMonthlyCommission}
                          className="px-2 py-1 text-white bg-orange-500 rounded"
                        >
                          Save
                        </button>
                      </td>
                    )}

                    {/* <td className="px-6 py-4 text-center">
                      {commission.classesTaken}
                    </td> */}
                  </tr>
                ))}

              <tr className="bg-white border-b ">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                  <select
                    className=""
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option>Select Month</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap ">
                  <select
                    className=""
                    value={selectedYear}
                    s
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option>Select Year</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </td>

                {/* <td className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap ">
                  <input
                    type="text"
                    className=""
                    placeholder="Monthly Classes"
                    value={monthlyClassTaken}
                    onChange={(e) => setMonthlyClassTaken(e.target.value)}
                  ></input>
                 
                </td> */}

                <td className="px-6 py-4 text-center">0</td>

                <td className="px-6 py-4 text-center">Unpaid</td>
                <td className="px-6 py-4 text-center"></td>
                <td className="px-6 py-4 text-center"></td>

                <td className="px-2 py-4 text-center">
                  <button
                    className="px-2 py-1 ml-2 text-gray-200 bg-green-600 rounded-md"
                    onClick={updateMonthlyCommission}
                  >
                    Update
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>

          <div className="relative p-6 bg-white rounded-lg shadow-xl">
            <svg
              className="absolute top-0 right-0 w-5 h-5 p-1 m-2 -mb-1 text-2xl bg-red-600 rounded-full cursor-pointer text-gray-50"
              onClick={() => setShowPopup(false)}
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
            <p className="mb-4 text-xl font-bold">{selectedStudentName}</p>
            <div className="flex items-center">
              <input
                type="text"
                value={numberOfClassesTaken}
                onChange={(e) => setNumberOfClassesTaken(e.target.value)}
                className="w-full "
                placeholder="Enter Number of Classes Taken"
              />

              <button
                className="p-2 text-gray-100 bg-green-500 "
                onClick={updateAttendance}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <div className="mt-8 text-3xl">Student List</div>
        <table className="w-full text-sm text-center text-gray-500 shadow-xl rtl:text-right">
          <thead className="text-xs text-gray-100 uppercase bg-orange-500">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Phone
              </th>
              <th scope="col" className="px-6 py-3">
                DOB
              </th>
            </tr>
          </thead>
          <tbody>
            {studentList.length > 0 ? (
              studentList.map((student, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-6 py-4">{student.name || "N/A"}</td>
                  <td className="px-6 py-4">{student.phone || "N/A"}</td>
                  <td className="px-6 py-4">
                    {student?.dob
                      ? new Date(student?.dob).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-4 text-center">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherAllStudentEachCourse;
