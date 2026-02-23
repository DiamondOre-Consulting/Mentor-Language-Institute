import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { useJwt } from "react-jwt";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const EachStu = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [classes, setAllClasses] = useState([]);
  const navigate = useNavigate();
  const { get, put } = useApi();
  const [studentsDetails, setStudentsDetails] = useState(null);
  const { id } = useParams();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  const [attendenceDetails, setAttendenceDetails] = useState(null);
  const [feedetails, setFeeDetails] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [paidStatus, setPaidStatus] = useState("pending");
  const [totafee, setTotalFee] = useState("");
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        // Fetch student details
        const studentResponse = await get({
          url: `/admin-confi/all-students/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (studentResponse.status === 200) {
          // Set student details
          setStudentsDetails(studentResponse.data);

          // Fetch classes associated with the student
          const classIds = studentResponse.data.classes || [];
          const classResponses = await Promise.allSettled(
            classIds.map((classId) =>
              get({
                url: `/admin-confi/all-classes/${classId}`,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }).unwrap()
            )
          );

          const classesData = classResponses
            .filter(
              (result) =>
                result.status === "fulfilled" &&
                result.value.status === 200 &&
                result.value.data
            )
            .map((result) => result.value.data);

          const classesWithTeacher = classesData.map((course) => {
            const primaryTeacher = course?.teachers?.[0]?.teacherId || null;
            return { ...course, teacher: primaryTeacher };
          });

          setAllClasses(classesWithTeacher);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id, token]);


  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleCourseSelection = (event) => {
    setSelectedCourseId(event.target.value);
  };


  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      setLoading(true);
      try {
        if (selectedCourseId) {
          const attendanceResponse = await get({
            url: `/admin-confi/attendance/${selectedCourseId}/${id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).unwrap();
          if (attendanceResponse.status === 200) {
            // console.log("Attendance details:", attendanceResponse.data);
            setAttendenceDetails(attendanceResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch attendance details when the selected course ID changes
    fetchAttendanceDetails();
  }, [selectedCourseId, id, token]);

  // getfee

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
        if (selectedCourseId) {
          const FeeResponse = await get({
            url: `/admin-confi/fee/${selectedCourseId}/${id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).unwrap();

          if (FeeResponse.status === 200) {
            setTotalFee(FeeResponse.data.totalFee);
            const feeDetailsWithMonthNames = {
              ...FeeResponse.data,
              detailFee: FeeResponse?.data?.detailFee?.map((fee) => ({
                ...fee,
                feeMonth: normalizeMonthLabel(fee.feeMonth),
              })),
            };
            setFeeDetails(feeDetailsWithMonthNames);
          }
        }
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      }
    };

    // Fetch attendance details when the selected course ID changes
    fetchFeeDetails();
  }, [selectedCourseId, id, token]);

  // fee update

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

  const handleFeeUpdate = async () => {
    try {
      if (!selectedMonth || !paidStatus) {
        alert("Please fill in all fields.");
        return;
      }
      const isPaid = paidStatus === "yes";
      const normalizedAmount = isPaid ? Number(amount) : 0;
      if (isPaid && (!amount || Number.isNaN(normalizedAmount) || normalizedAmount <= 0)) {
        alert("Please enter a valid amount.");
        return;
      }

      const response = await put({
        url: `/admin-confi/update-fee/${selectedCourseId}/${id}`,
        data: {
          feeMonth: monthNameToNumber[selectedMonth],
          paid: isPaid,
          amountPaid: normalizedAmount,
          totalFee: totalFee,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response?.status === 200) {
        // console.log("Fee updated successfully");
        const updatedFeeDetails = [...(feedetails?.detailFee || [])];
        const existingIndex = updatedFeeDetails.findIndex(
          (fee) => fee.feeMonth === selectedMonth
        );
        if (existingIndex >= 0) {
          updatedFeeDetails[existingIndex] = {
            ...updatedFeeDetails[existingIndex],
            feeMonth: selectedMonth,
            amountPaid: normalizedAmount,
            paid: isPaid,
          };
        } else {
          updatedFeeDetails.push({
            feeMonth: selectedMonth,
            amountPaid: normalizedAmount,
            paid: isPaid,
          });
        }
        setFeeDetails({ ...feedetails, detailFee: updatedFeeDetails });
        setAmount("");
        setPaidStatus("pending");
      }
    } catch (error) {
      console.error("Error updating fee:", error);
    }
  };


  return (
    <>
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
      <div class="px-4 sm:px-1 lg:px-8">
        <h1 class=" text-3xl font-semibold  tracking-tight text-gray-900">
          {studentsDetails?.name}
        </h1>
        <p class="text-gray-500">{studentsDetails?.phone}</p>
      </div>
      <main className="overflow-x-hidden">
        <div class="mt-4 md:mt-32 md:max-w-7xl py-0 ">
          <div class="flex flex-wrap  md:-mx-2  ">
            <div class="w-full mx-2 md:block lg:block md:-mt-24 sm:mt-0">
              <div class="block lg:block overflow-scroll md:overflow-hidden">
                <ul class="flex bg-white ">
                  <li class=" mr-1">
                    <a
                      class="rounded-sm bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-orange-500 font-semibold shadow-md cursor-pointer"
                      onClick={() => handleTabClick("personal")}
                    >
                      Personal Information
                    </a>
                  </li>
                  <li class="mr-1">
                    <a
                      class="rounded-sm bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-orange-500 font-semibold cursor-pointer"
                      onClick={() => handleTabClick("EnrolledCourses")}
                    >
                      Enrolled Courses
                    </a>
                  </li>
                  <li class="mr-1">
                    <a
                      class="rounded-sm bg-white inline-block py-2 px-4 border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-orange-500 font-semibold cursor-pointer"
                      onClick={() => handleTabClick("FeeDetails")}
                    >
                      Fee Details
                    </a>
                  </li>
                  <li class="mr-1">
                    <a
                      class="rounded-sm bg-white inline-block py-2 px-4 border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-orange-500 font-semibold cursor-pointer"
                      onClick={() => handleTabClick("AttendanceDetails")}
                    >
                      Attendance Details
                    </a>
                  </li>
                </ul>
              </div>
              {activeTab === "personal" && (
                <div class="w-full mt-8 flex flex-col 2xl:w-1/3">
                  <div class="flex-1 bg-white rounded-lg shadow-xl p-8">
                    <ul class="mt-2 text-gray-700">
                      <li class="flex border-y py-2">
                        <span class="font-bold w-24">Full name:</span>
                        <span class="text-gray-700">
                          {studentsDetails?.name}
                        </span>
                      </li>
                      <li class="flex border-b py-2">
                        <span class="font-bold w-24">phone:</span>
                        <span class="text-gray-700">
                          {studentsDetails?.phone}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "EnrolledCourses" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2 bg-white pt-10 ">
                  {classes.length === 0 ? (
                    <div>No classes are there</div>
                  ) : (
                    classes.map((course) => (
                      <a class="block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100   ">
                        <h5 class="mb-2 text-md md:text-xl font-bold tracking-tight text-gray-900 ">
                          {course?.classTitle}
                        </h5>
                        {/* <p class="font-normal text-sm text-gray-700 ">classSchedule:- <span>{course?.classSchedule}</span></p> */}
                        <p class="font-normal text-sm text-gray-700 ">
                          Duration :- <span>{course?.totalHours}</span>
                        </p>
                        <p class="font-normal text-sm text-gray-700 ">
                          Teach By :-{" "}
                          <span>
                            {course?.teacher ? course.teacher.name : "Unknown"}
                          </span>
                        </p>
                      </a>
                    ))
                  )}
                </div>
              )}

              {activeTab === "FeeDetails" && (
                <div className="max-w-full overflow-hidden bg-white pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <select
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700 sm:w-72"
                    onChange={handleCourseSelection}
                    value={selectedCourseId || ""}
                  >
                    <option value="" disabled>
                      Select a course
                    </option>
                    {classes.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.classTitle}
                      </option>
                    ))}
                  </select>
                    <span className="inline-flex w-fit rounded-md bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                      Total Fee: {totafee || 0}
                    </span>
                  </div>
                  <div>
                    <div className="relative mt-6 max-w-full overflow-x-auto rounded-lg border border-slate-200">
                      <table className="min-w-[640px] w-full text-sm text-left text-gray-500">
                        <thead className="bg-slate-100 text-xs uppercase text-gray-700">
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
                            feedetails?.detailFee?.map((fee) => (
                              <tr className="border-b bg-white">
                                <th
                                  scope="row"
                                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                                >
                                  {fee.feeMonth}
                                </th>

                                <th
                                  scope="row"
                                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                                >
                                  {fee.amountPaid.toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                  })}
                                </th>

                                <td
                                  className={`px-6 py-4 ${
                                    fee.paid ? "text-green-500" : "text-red-400"
                                  }`}
                                >
                                  {fee.paid ? "Submitted" : "Due"}
                                </td>
                              </tr>
                            ))}

                          <tr className="bg-white border-b  ">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <select
                                className="rounded-md border border-slate-300 bg-white px-2 py-1"
                                onChange={(e) =>
                                  setSelectedMonth(e.target.value)
                                }
                              >
                                <option>Select Month</option>
                                {months.map((month, index) => (
                                  <option key={index} value={month}>
                                    {month}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-6 py-4 font-medium text-gray-900">
                              <input
                                type="text"
                                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 sm:w-auto"
                                placeholder="Enter Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={paidStatus === "pending"}
                              ></input>
                            </td>

                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                      type="radio"
                                      name="paidStatus"
                                      value="pending"
                                      checked={paidStatus === "pending"}
                                      onChange={() => setPaidStatus("pending")}
                                    />
                                    Pending
                                  </label>
                                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                      type="radio"
                                      name="paidStatus"
                                      value="yes"
                                      checked={paidStatus === "yes"}
                                      onChange={() => setPaidStatus("yes")}
                                    />
                                    Yes
                                  </label>
                                </div>
                                <button
                                  className="rounded-md bg-green-600 px-4 py-2 text-gray-200"
                                  onClick={handleFeeUpdate}
                                >
                                  Update Fee
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {
                // person will select course the month the date come when the enrolld and thart month make the logic if sunday hai to write sunday
                activeTab === "AttendanceDetails" && (
                  <div className="bg-white pt-10">
                    <div className="flex ">
                      <select onChange={handleCourseSelection}>
                        <option value="">Select Course</option>
                        {classes.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.classTitle}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div class="relative overflow-x-auto mt-8">
                        <table class="w-full text-sm text-center rtl:text-center text-gray-500 ">
                          <thead class="text-xs text-gray-700 uppercase bg-gray-50  ">
                            <tr>
                              <th scope="col" class="px-6 py-3">
                                Date
                              </th>
                              <th scope="col" class="px-6 py-3">
                                Number Of Classes Taken
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendenceDetails &&
                              attendenceDetails.detailAttendance.map(
                                (attendance) => (
                                  <tr class="bg-white border-b  ">
                                    <th
                                      scope="row"
                                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                    >
                                      {attendance.classDate}
                                    </th>
                                    <td className={`px-6 py-4`}>
                                      {attendance.numberOfClassesTaken}
                                    </td>
                                  </tr>
                                )
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              }

              <div class="my-1 "></div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EachStu;


