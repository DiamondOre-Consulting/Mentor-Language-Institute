import { useEffect, useState } from "react";
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

const EachTeacherClassStudentAttendance = () => {
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { id, selectedClassId } = useParams();
  const [studentList, setStudentList] = useState([]);
  const [courseDetails, setCourseDetails] = useState([]);
  const [showPopupMonthly, setShowPopupMonthly] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [numberOfClasses, setNumberOfClasses] = useState("");
  const [studentDetails, setStudentsDetails] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
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

        const response = await get({
          url: `/admin-confi/all-classes/${selectedClassId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (response.status === 200) {
          setCourseDetails(response.data);
          // console.log("course details", response.data)
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

        const attendanceResponse = await get({
          url: `/admin-confi/attendance/${selectedClassId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            attendanceDate: selectedDate, // Pass attendanceDate as a query parameter
            teacherId: id,
          },
        }).unwrap();

        if (attendanceResponse.status === 200) {
          // console.log("a det", attendanceResponse.data)
          // const filteredData = attendanceResponse?.data?.filter
          setAttendanceDetails(attendanceResponse.data);

          // console.log("mapping", mapping)
          // console.log("mapping", numberOfClassesTakenValues)

          const studentIds = attendanceResponse.data.map(
            (item) => item.studentId
          );
          // console.log("student ids", studentIds)
          const studentData = [];
          for (const studentid of studentIds) {
            const studentResponse = await get({
              url: `/admin-confi/all-students/${studentid}`,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).unwrap();
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


  const fetchMonthlyCommission = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const monthlyCommissionReport = await get({
        url: `/admin-confi/monthly-commission/${id}/${selectedClassId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (monthlyCommissionReport.status === 200) {
        setMonthlyCommissionDetails(monthlyCommissionReport.data);
      }
    } catch (error) {
      console.log("");
    }
  };

  //  get monthly commission
  useEffect(() => {
    fetchMonthlyCommission();
  }, [selectedClassId, id]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentList = await get({
          url: `/admin-confi/get-studentsListBySub/${selectedClassId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

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

      const response = await post({
        url: `/admin-confi/update-monthly-commission/${commissionId}`,
        data: {
          paid,
          remarks,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setShowPopupMonthly(false);
        setPaid("");
        setRemarks("");
        fetchMonthlyCommission();
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
            {selectedDate && (
              <div>
                <div
                  className="px-6 sm:px-12 py-2 bg-gray-100 border border-2 rounded-md"
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
              {studentDetails.map((student) => {
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
                        {teachercommission}
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
                <th scope="col" className="px-6 py-3">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody>
              {monthCommissionDetails &&
                monthCommissionDetails.map((commission) => (
                  <tr
                    key={commission?._id || `${commission?.monthName}-${commission?.year}`}
                    className="bg-white border-b hover:bg-gray-50"
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
                    <td className="px-6 py-4 text-center">
                      <button
                        className="px-2 py-1 text-white bg-blue-600 rounded"
                        onClick={() =>
                          handleFetchMonthlyCommisssionDetails(
                            commission._id,
                            commission.monthName
                          )
                        }
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPopupMonthly && (
        <div className="app-modal-overlay">
          <div className="app-modal-card app-modal-card-sm relative">
            <svg
              className="absolute right-4 top-4 h-6 w-6 cursor-pointer rounded-full bg-red-600 p-1 text-gray-50"
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
            <p className="mb-4 text-xl font-bold text-slate-900">{selectedMonthName}</p>
            <div className="flex flex-col items-center">
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
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
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


