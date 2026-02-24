import { useApi } from "../../../api/useApi";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Tabs } from "flowbite-react";
import { HiAdjustments } from "react-icons/hi";
import { FaBook } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import userimg2 from "..//..//..//assets/userimg2.png";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value) => {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getNextSessionLabel = (entries) => {
  if (!entries || entries.length === 0) return "TBA";
  const sessions = entries
    .map((entry) => {
      const date = new Date(entry.classDate);
      if (Number.isNaN(date.getTime())) return null;
      return { ...entry, date };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

  if (sessions.length === 0) return "TBA";

  const today = new Date();
  const nextSession =
    sessions.find((session) => session.date >= today) ||
    sessions[sessions.length - 1];

  return formatDate(nextSession.classDate);
};

const Coursedet = () => {
  const navigate = useNavigate();
  const { get } = useApi();
  const { id } = useParams();
  const [studentData, setStudentData] = useState("");
  const [classData, setClassData] = useState("");
  const [feedetails, setFeeDetails] = useState(null);
  const [myenroll, setEnroll] = useState("");
  const [loading, setLoading] = useState(false);
  const scheduleEntries = classData?.dailyClasses || [];
  const totalScheduledClasses = scheduleEntries.reduce(
    (total, entry) => total + toNumber(entry.numberOfClasses),
    0
  );
  const nextSessionLabel = getNextSessionLabel(scheduleEntries);
  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        // Token not found in local storage, handle the error or redirect to the login page
        console.error("No token found");
        navigate("/student-login");
        return;
      }

      // Fetch associates data from the backend
      const response = await get({
        url: "/students/my-profile",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status == 200) {
        // console.log("studetails", response.data);
        const studentdetails = response.data;
        setStudentData(studentdetails);

        const classes = response.data.classes;
        // console.log("classes", classes)

        const allEnrClassData = [];
        for (const ids of classes) {
          const AllEnrollResponse = await get({
            url: `/students/all-courses/${ids}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).unwrap();

          if (AllEnrollResponse.status === 200) {
            // console.log("allenrollids", AllEnrollResponse.data)
            const enroll = AllEnrollResponse.data;
            allEnrClassData.push(enroll);
            setEnroll(allEnrClassData); // Update state variable here instead of setEnroll
            // console.log("allenrolls", myenroll)
          }
        }

        const classResponse = await get({
          url: `/students/all-courses/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (classResponse.status === 200) {
          const classData = classResponse.data;
          const primaryTeacher = classData?.teachers?.[0]?.teacherId;
          const normalizedClass = primaryTeacher
            ? { ...classData, teacher: primaryTeacher }
            : classData;
          // console.log("Enrolled class details:", normalizedClass);
          setClassData(normalizedClass);
        }
      } else {
        // console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  // get attendence
  const [attendenceDetails, setAttendenceDetails] = useState(null);

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          // Token not found in local storage, handle the error or redirect to the login page
          console.error("No token found");
          navigate("/student-login");
          return;
        }

        const attendanceResponse = await get({
          url: `/students/my-attendance/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (attendanceResponse.status === 200) {
          // console.log("Attendance details:", attendanceResponse.data);
          setAttendenceDetails(attendanceResponse.data);
        }
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch attendance details when the selected course ID changes
    fetchAttendanceDetails();
  }, [id]);

  // getFeedetails
  const numberToMonthName = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  const normalizeMonthLabel = (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return "";
      }
      const numeric = Number(trimmed);
      if (Number.isInteger(numeric)) {
        return numberToMonthName[numeric] || "";
      }
      return trimmed;
    }
    if (Number.isInteger(value)) {
      return numberToMonthName[value] || "";
    }
    return "";
  };

  useEffect(() => {
    const fetchFeeDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          // Token not found in local storage, handle the error or redirect to the login page
          console.error("No token found");
          navigate("/student-login");
          return;
        }

        const FeeResponse = await get({
          url: `/students/my-fee-details/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (FeeResponse.status === 200) {
          // console.log("Fee details:", FeeResponse.data);
          const feeDetailsWithMonthNames = {
            ...FeeResponse.data,
            detailFee: FeeResponse.data.detailFee.map((fee) => ({
              ...fee,
              feeMonth: normalizeMonthLabel(fee.feeMonth),
            })),
          };
          setFeeDetails(feeDetailsWithMonthNames);
        }
      } catch (error) {
        console.error("Error fetching Fee details:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch attendance details when the selected course ID changes
    fetchFeeDetails();
  }, [id]);

  return (
    <>
      {" "}
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
      <div className="p-10 md:p-20 ">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="col-span-2">
            <h1 className="text-3xl text-wrap  md:text-4xl font-bold">
              {classData?.classTitle}
            </h1>
            <div className="pt-4">
              <div className="flex justify-between">
                <div className="flex">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={userimg2}
                    alt="Rounded avatar"
                  />
                  <div className="flex flex-col mx-2">
                    <p className="text-gray-700 font-bold">
                      {classData.teacher?.name}
                    </p>
                    <p className="text-gray-600 -mt-1">Teacher</p>
                  </div>
                </div>
              </div>

              {/* section */}
              <div className="mt-10">
                <Tabs aria-label="Tabs with icons" style="underline">
                  <Tabs.Item
                    active
                    title="Course Details"
                    icon={FaBook}
                    className="focus:outline-none"
                  >
                    <div className="">
                      <p className="md:text-2xl text-orange-500 font-bold mb-6">
                        Course Details
                      </p>

                      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                          <tbody>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Student Name
                              </th>
                              <td className="px-6 py-4">{studentData?.name}</td>
                            </tr>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Course Tilte
                              </th>
                              <td className="px-6 py-4">{classData?.classTitle}</td>
                            </tr>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Teacher Name
                              </th>
                              <td className="px-6 py-4">
                                {classData.teacher?.name}
                              </td>
                            </tr>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Branch
                              </th>
                              <td className="px-6 py-4">{classData?.branch || "Main"}</td>
                            </tr>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Grade
                              </th>
                              <td className="px-6 py-4">{classData?.grade || "All levels"}</td>
                            </tr>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Total Hours
                              </th>
                              <td className="px-6 py-4">
                                {classData?.totalHours
                                  ? `${classData.totalHours} hours`
                                  : "TBA"}
                              </td>
                            </tr>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Total Scheduled Classes
                              </th>
                              <td className="px-6 py-4">
                                {totalScheduledClasses || "TBA"}
                              </td>
                            </tr>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Next Session
                              </th>
                              <td className="px-6 py-4">{nextSessionLabel}</td>
                            </tr>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Added On
                              </th>
                              <td className="px-6 py-4">
                                {formatDate(classData?.createdAt)}
                              </td>
                            </tr>
                            <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Course Price
                              </th>
                              <td className="px-6 py-4">
                                INR {feedetails?.totalFee}
                              </td>
                            </tr>
                            {/* <tr className="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                                                                Schedule
                                                            </th>
                                                            <td className="px-6 py-4">
                                                                {classData?.classSchedule}
                                                            </td>
                                                        </tr> */}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Tabs.Item>
                  <Tabs.Item
                    title="Attendance Details"
                    icon={MdDashboard}
                    className="focus:outline-none"
                  >
                    <div className="">
                      <p className="text-2xl text-orange-500 font-bold mb-6">
                        Attendance Details
                      </p>

                      <div className="overflow-auto max-h-96 overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-center rtl:text-right text-gray-500 ">
                          <thead className="sticky top-0 text-xs text-gray-100 uppercase bg-orange-400  ">
                            <tr>
                              <th scope="col" className="px-6 py-3">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3">
                                Number of Classes Taken
                              </th>
                            </tr>
                          </thead>
                          <tbody className="overflow-y-auto max-h-80">
                            {attendenceDetails &&
                            attendenceDetails.detailAttendance.length === 0 ? (
                              <p>No Attendance details available</p>
                            ) : (
                              attendenceDetails &&
                              attendenceDetails.detailAttendance.map(
                                (attendance) => (
                                  <tr
                                    key={attendance?._id || attendance?.classDate}
                                    className="bg-white border-b  "
                                  >
                                    <th
                                      scope="row"
                                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                    >
                                      {attendance.classDate}
                                    </th>
                                    <td className={`px-6 py-4 `}>
                                      {attendance.numberOfClassesTaken}
                                    </td>
                                  </tr>
                                )
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* <div className='mt-10 border-t-4 border-t-orange-500  w-1/3 p-2 rounded-md shadow-md'>
                                                <p>Total Classes : 42</p>
                                                <p>Total Class Taken : 12</p>
                                                <p>Total Absent : 4</p>
                                            </div> */}
                    </div>
                  </Tabs.Item>
                  <Tabs.Item
                    title="Fee Details"
                    icon={HiAdjustments}
                    className="focus:outline-none"
                  >
                    <div className="">
                      <p className="text-2xl text-orange-500 font-bold mb-6">
                        Fee Details
                      </p>

                      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                          <thead className="text-xs text-gray-100 uppercase bg-orange-400  ">
                            <tr>
                              <th scope="col" className="px-6 py-3">
                                Month
                              </th>
                              <th scope="col" className="px-6 py-3">
                                Amount
                              </th>
                              <th scope="col" className="px-6 py-3">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedetails &&
                              feedetails.detailFee.map((fee) => (
                                <tr
                                  key={fee?._id || fee?.feeMonth}
                                  className="bg-white border-b  "
                                >
                                  <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                  >
                                    {fee.feeMonth}
                                  </th>

                                  <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                  >
                                    {fee.amountPaid}
                                  </th>

                                  <td
                                    className={`px-6 py-4 ${
                                      fee.paid
                                        ? "text-green-500"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {fee.paid ? "Submitted" : "Due"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Tabs.Item>
                </Tabs>
              </div>

              {/* section2 */}
            </div>
          </div>

          <div className="flex mt-10 md:mt-0">
            <div className="border border-0 rounded-md bl-4 w-1 h-60 bg-gradient-to-b from-orange-500 to-stone-200"></div>
            <div className="flex">
              <div className="flex-col mx-3  cursor-pointer">
                <p className="text-gray-700 font-bold text-xl mb-2">
                  Enrolled Courses
                </p>
                {myenroll.length === 0 ? (
                  <p className="text-center font-bold bg-orange-400 p-4 flex items-center justify-center text-gray-200 rounded-md">
                    No Enrolled Courses are there
                  </p>
                ) : (
                  myenroll.map((enroll) => (
                    <div key={enroll._id}>
                      <Link
                        to={`/student-each-course/${enroll._id}`}
                        className="py-1 hover:text-orange-500"
                      >
                        {enroll?.classTitle}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Coursedet;


