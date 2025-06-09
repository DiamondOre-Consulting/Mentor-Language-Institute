import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import userimg2 from "..//..//assets/userimg2.png";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const EachTeacherClassStudentAttendance = () => {
  const navigate = useNavigate();
  const { id, selectedClassId } = useParams();
  const [studentList, setStudentList] = useState([]);
  const [allDetails, setAllDetails] = useState([]);
  const [courseDetails, setCourseDetails] = useState([]);
  const [attendanceDetailsMap, setAttendanceDetailsMap] = useState({});
  const [studentId, setStudentId] = useState([]);
  const [myenrolledStudentDetails, setMyEnrolledStudentsDetails] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupMonthly, setShowPopupMonthly] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [numberOfClasses, setNumberOfClasses] = useState("");
  const [selectedstudentId, setSelectedStudentId] = useState(null);
  const [numberOfClassesTaken, setNumberOfClassesTaken] = useState(0);
  const [studentDetails, setStudentsDetails] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [commission, setCommission] = useState("");
  const [monthCommissionDetails, setMonthlyCommissionDetails] = useState([]);
  const [commissionId, setCommissionId] = useState(null);
  const [selectedMonthName, setSelectedMonthName] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [paid, setPaid] = useState("");
  const [loading, setLoading] = useState(false);

  //FETCH COURSE DETAILS
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(false);
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:7000/api/admin-confi/all-classes/${selectedClassId}`,
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
          // console.log("course details", response.data)
          const enrolledStudents = courseData.enrolledStudents;
          const enrolledStudentsDetails = [];

          for (const studentIds of enrolledStudents) {
            const studentResponse = await axios.get(
              `http://localhost:7000/api/admin-confi/all-students/${studentIds}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (studentResponse.status === 200) {
              const studentData = studentResponse.data;
              // console.log("Enrolled student details:", studentData);
              enrolledStudentsDetails.push(studentData);
              setMyEnrolledStudentsDetails(enrolledStudentsDetails);
            }
          }
        }
      } catch (error) {
        console.log("");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [selectedClassId, navigate]);

  // fetch attendence details are
  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token not found");
          return;
        }

        const attendanceResponse = await axios.get(
          `http://localhost:7000/api/admin-confi/attendance/${selectedClassId}`,
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
          // console.log("a det", attendanceResponse.data)
          // const filteredData = attendanceResponse?.data?.filter
          const mapping = attendanceResponse.data
            .filter((item) => item.detailAttendance)
            .map((item) => item.detailAttendance);

          const numberOfClassesTakenValues = mapping.map((detailAttendance) =>
            detailAttendance.map((detail) => detail.numberOfClassesTaken)
          );
          setAttendanceDetails(attendanceResponse.data);

          // console.log("mapping", mapping)
          // console.log("mapping", numberOfClassesTakenValues)

          const studentIds = attendanceResponse.data.map(
            (item) => item.studentId
          );
          // console.log("student ids", studentIds)
          const studentData = [];
          for (const studentid of studentIds) {
            const studentResponse = await axios.get(
              `http://localhost:7000/api/admin-confi/all-students/${studentid}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (studentResponse.status === 200) {
              const data = studentResponse.data;

              // console.log(daattaa,data)
              studentData.push(data);

              // console.log("allstudents details", studentDetails)
            }
          }
          setStudentsDetails(studentData);
        }
      } catch (error) {
        console.log("");
      }
    };

    // Call fetchAttendanceDetails when selectedDate or selectedClassId changes
    fetchAttendanceDetails();
  }, [selectedDate, selectedClassId]);

  const handleFetchStudentDetails = (studentId, studentName) => {
    // console.log('Student ID:', studentId);
    // console.log('Student Name:', studentName);
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
      setNumberOfClasses(selectedDateObj.numberOfClasses); // Access the number of classes from the selected date object
    }
  };

  // update commissionperday

  const updateCommissionPerDay = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
      }
      if (!selectedDate) {
        alert("Please select a date first.");
        return;
      }

      const response = await axios.post(
        `http://localhost:7000/api/admin-confi/update-commission/${selectedClassId}/${selectedstudentId}`,
        {
          classDate: selectedDate,
          commission,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // console.log(response.data);
        // console.log("commission Updated")
        setShowPopup(false);
        // setAttendanceDetailsMap(prevAttendanceDetailsMap => ({
        //     ...prevAttendanceDetailsMap,
        //     [selectedstudentId]: numberOfClassesTaken
        // }));
      }
    } catch (error) {
      console.log("");
    }
  };

  //  get monthly commission
  useEffect(() => {
    const getMonthlyCommission = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // const commission = [];

        const monthlyCommissionReport = await axios.get(
          `http://localhost:7000/api/admin-confi/monthly-commission/${id}/${selectedClassId}`,
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
      }
    };

    getMonthlyCommission();
  }, [selectedClassId]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentList = await axios.get(
          `http://localhost:7000/api/admin-confi/get-studentsListBySub/${selectedClassId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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

  // handleFetchMonthlyCommisssionDetails

  const handleFetchMonthlyCommisssionDetails = (
    commissionIdIs,
    selectedMonth
  ) => {
    // console.log(commissionIdIs)
    setCommissionId(commissionIdIs);
    setSelectedMonthName(selectedMonth);
    setShowPopupMonthly(true);
  };

  // update monthly commission

  const updateMonthlyCommission = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("no Token Found");
        navigate("/login");
      }

      const response = await axios.post(
        `http://localhost:7000/api/admin-confi/update-monthly-commission/${commissionId}`,
        {
          commission,
          paid,
          remarks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setShowPopupMonthly(false);
        window.location.reload();

        // Clear the input fields
        setCommission("");
        setPaid("");
        setRemarks("");
      }
    } catch (error) {
      console.log("");
    }
  };

  return (
    <>
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
      <h1 className="mb-1 text-4xl font-semibold text-gray-700 text-start">
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
                  (attendance) => attendance.studentId === student?._id
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

                const teachercommission = studentAttendanceDetails
                  ? studentAttendanceDetails.detailAttendance
                      .filter((details) => details.classDate === selectedDate)
                      .reduce(
                        (totalCommission, detail) =>
                          totalCommission + detail.commission,
                        0
                      )
                  : 0;

                const showEditIcon = teachercommission === 0;

                return (
                  <tr key={student?._id} className="bg-white border-b ">
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
                          {student?.name}
                        </div>
                        <div className="font-normal text-gray-500">
                          {student?.phone}
                        </div>
                      </div>
                    </th>
                    <td className="text-center cursor-pointer hover:bg-gray-50">
                      {studentTotalClassesTaken}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {showEditIcon ? (
                          <svg
                            onClick={() =>
                              handleFetchStudentDetails(
                                student?._id,
                                student?.name
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
                          <div>{teachercommission}</div>
                        )}
                      </div>
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
                <th scope="col" className="px-6 py-3">
                  Classes Taken
                </th>

                <th scope="col" className="px-6 py-3">
                  commission
                </th>
                <th scope="col" className="px-6 py-3">
                  paid
                </th>
                <th scope="col" className="px-6 py-3">
                  Remarks(if any)
                </th>
              </tr>
            </thead>
            <tbody>
              {monthCommissionDetails &&
                monthCommissionDetails.map((commission, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      handleFetchMonthlyCommisssionDetails(
                        commission._id,
                        commission.monthName
                      )
                    }
                  >
                    <td className="px-6 py-4 text-center">
                      {commission.monthName}
                    </td>
                    <td className="px-6 py-4 text-center">{commission.year}</td>
                    <td className="px-6 py-4 text-center">
                      {commission.classesTaken}
                    </td>
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

                    <td className="px-6 py-4 text-center">
                      {commission.remarks}
                    </td>
                  </tr>
                ))}
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
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full "
                placeholder="Enter Commission Amount"
              />

              <button
                className="p-2 text-gray-100 bg-green-500 "
                onClick={updateCommissionPerDay}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopupMonthly && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>

          <div className="relative p-6 bg-white rounded-lg shadow-xl">
            <svg
              className="absolute top-0 right-0 w-5 h-5 p-1 m-2 -mb-1 text-2xl bg-red-600 rounded-full cursor-pointer text-gray-50"
              onClick={() => setShowPopupMonthly(false)}
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
            <p className="mb-4 text-xl font-bold">{selectedMonthName}</p>
            <div className="flex flex-col items-center">
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full mb-2"
                placeholder="Enter Commission Amount"
              />
              <select
                className="w-full mb-2"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
              >
                <option>select status</option>
                <option value="true">Paid</option>
              </select>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full h-24 p-2 mb-2 border rounded-md resize-none"
                placeholder="Enter remark..."
              ></textarea>
              <button
                className="p-2 text-gray-100 bg-green-500"
                onClick={updateMonthlyCommission}
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
                Dob
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
                      ? new Date(student.dob).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
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
    </>
  );
};

export default EachTeacherClassStudentAttendance;
