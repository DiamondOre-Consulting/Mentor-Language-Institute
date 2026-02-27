import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import userimg2 from "..//..//assets/userimg2.png";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const TeacherAllStudentEachCourse = () => {
  const navigate = useNavigate();
  const { get, put } = useApi();
  const { selectedClassId } = useParams();
  const [courseDetails, setCourseDetails] = useState([]);
  const [attendanceDetailsMap, setAttendanceDetailsMap] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [numberOfClasses, setNumberOfClasses] = useState("");
  const [attendanceMode, setAttendanceMode] = useState("offline");
  const [selectedstudentId, setSelectedStudentId] = useState(null);
  const [numberOfClassesTaken, setNumberOfClassesTaken] = useState("");
  const [studentDetails, setStudentsDetails] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [monthCommissionDetails, setMonthlyCommissionDetails] = useState([]);
  const [loading, setLoading] = useState(false);

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

        const response = await get({
          url: `/teachers/my-classes/${selectedClassId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (response.status === 200) {
          const courseData = response.data;
          setCourseDetails(response.data);
          const enrolledStudents = courseData.enrolledStudents;
          const enrolledStudentsDetails = [];

          for (const studentIds of enrolledStudents) {
            const studentResponse = await get({
              url: `/teachers/student/${studentIds}`,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).unwrap();

            if (studentResponse.status === 200) {
              const studentData = studentResponse.data;
              enrolledStudentsDetails.push(studentData);
              setLoading(false);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
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

      const attendanceResponse = await get({
        url: `/teachers/attendance/${selectedClassId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          attendanceDate: selectedDate, // Pass attendanceDate as a query parameter
          mode: attendanceMode,
        },
      }).unwrap();

      if (attendanceResponse.status === 200) {
        setAttendanceDetails(attendanceResponse.data);

        const studentIds = attendanceResponse.data.map(
          (item) => item.studentId
        );
        const studentData = [];
        for (const studentid of studentIds) {
          const studentResponse = await get({
            url: `/teachers/student/${studentid}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).unwrap();
          if (studentResponse.status === 200) {
            const data = studentResponse.data;
            studentData.push(data);
          }
        }
        setStudentsDetails(studentData);

        setAttendanceDetailsMap({});
      }
    } catch (error) {
      console.error("Error fetching attendance details:", error);
    }
  };
  useEffect(() => {
    // Call fetchAttendanceDetails when selectedDate or selectedClassId changes
    fetchAttendanceDetails();
  }, [selectedDate, selectedClassId, attendanceMode]);

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
    setSelectedDate(selectedDate);
  };

  useEffect(() => {
    if (!selectedDate) {
      setNumberOfClasses("");
      return;
    }
    const selectedDateObj = courseDetails.dailyClasses?.find(
      (date) =>
        date.classDate === selectedDate &&
        (date.mode || "offline") === attendanceMode
    );
    if (selectedDateObj) {
      setNumberOfClasses(selectedDateObj.numberOfClasses);
    } else {
      setNumberOfClasses("");
    }
  }, [selectedDate, attendanceMode, courseDetails.dailyClasses]);

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

      const response = await put({
        url: `/teachers/update-attendance/${selectedClassId}/${selectedstudentId}`,
        data: {
          attendanceDate: selectedDate,
          numberOfClassesTaken,
          mode: attendanceMode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setShowPopup(false);
        setAttendanceDetailsMap((prevAttendanceDetailsMap) => ({
          ...prevAttendanceDetailsMap,
          [selectedstudentId]: numberOfClassesTaken,
        }));
        await getMonthlyCommission(true);
        await fetchAttendanceDetails();
        // handleFetchStudentDetails()
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyCommission = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // const commission = [];

      const monthlyCommissionReport = await get({
        url: `/teachers/my-commission/${selectedClassId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (monthlyCommissionReport.status === 200) {
        setMonthlyCommissionDetails(monthlyCommissionReport.data);
      }
    } catch (error) {
      console.log("");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getMonthlyCommission();
    const intervalId = setInterval(() => {
      getMonthlyCommission(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [selectedClassId]);

  const [studentList, setStudentList] = useState([]);
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const studentList = await get({
          url: `/teachers/class/all-students/${selectedClassId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (studentList?.status === 200) {
          setStudentList(studentList?.data || []);
        }
      } catch (error) {
        console.error("Error fetching student list:", error);
      }
    };
    fetchStudentData();
  }, []);

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
        {/* <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white ">

                    <label for="table-search" className="sr-only">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="text" id="table-search-users" className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500      " placeholder="Search for users" />
                    </div>
                </div> */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <select onChange={handleDateChange}>
              <option>Select Date</option>
              {courseDetails.dailyClasses &&
                courseDetails.dailyClasses.map((date) => {
                  return <option key={date._id}>{date.classDate}</option>;
                })}
            </select>
          </div>
          <div>
            <select
              value={attendanceMode}
              onChange={(e) => setAttendanceMode(e.target.value)}
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>
         <div>
  {selectedDate && numberOfClasses > 0 && (
    <div>
      <div
        className="px-6 sm:px-12 py-2 bg-gray-100 border border-2 rounded-md"
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
              {studentDetails.map((student) => {
                // Find the attendance details for the current student
                const studentAttendanceDetails = attendanceDetails.find(
                  (attendance) => attendance.studentId === student._id
                );
                const studentTotalClassesTaken = studentAttendanceDetails
                  ? studentAttendanceDetails.detailAttendance
                      .filter(
                        (detail) =>
                          detail.classDate === selectedDate &&
                          (detail.mode || "offline") === attendanceMode
                      )
                      .reduce(
                        (total, detail) =>
                          total + (+detail.numberOfClassesTaken || 0),
                        0
                      )
                  : 0;
                const showEditIcon = studentTotalClassesTaken === 0;

                const teachercommission = "-";

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

          <div className="mt-4">
            <h1 className="text-3xl">Monthly Commission</h1>
            <p className="mt-1 text-sm text-gray-500">
              Commission is managed by admin. Teachers can only view.
            </p>
          </div>

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
                  Offline Classes
                </th>
                <th scope="col" className="px-6 py-3">
                  Online Classes
                </th>
                <th scope="col" className="px-6 py-3">
                  Offline Commission
                </th>
                <th scope="col" className="px-6 py-3">
                  Online Commission
                </th>
                <th scope="col" className="px-6 py-3">
                  Total Commission
                </th>

                <th scope="col" className="px-6 py-3">
                  Paid
                </th>
              </tr>
            </thead>
            <tbody>
              {monthCommissionDetails &&
                monthCommissionDetails.map((commission) => (
                  <tr
                    key={commission?._id || `${commission?.monthName}-${commission?.year}`}
                    className="bg-white border-b cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-center">
                      {commission.monthName}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {commission.year}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {commission.offlineClassesTaken ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {commission.onlineClassesTaken ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {commission.offlineCommission ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {commission.onlineCommission ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {commission.commission ?? 0}
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPopup &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay">
            <div className="app-modal-card app-modal-card-sm relative">
              <svg
                className="absolute right-4 top-4 h-6 w-6 cursor-pointer rounded-full bg-red-600 p-1 text-gray-50"
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
                <path stroke="none" d="M0 0h24v24H0z" />
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <p className="mb-4 text-xl font-bold text-slate-900">{selectedStudentName}</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={numberOfClassesTaken}
                  onChange={(e) => setNumberOfClassesTaken(e.target.value)}
                  className="w-full"
                  placeholder="Enter Number of Classes Taken"
                />

                <button
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  onClick={updateAttendance}
                >
                  Update
                </button>
              </div>
            </div>
          </div>,
          document.body
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
              studentList.map((student) => (
                <tr key={student?._id || student?.phone} className="bg-white border-b">
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

