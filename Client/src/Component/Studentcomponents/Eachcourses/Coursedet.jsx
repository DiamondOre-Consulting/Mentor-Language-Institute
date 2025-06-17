import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Footer, Tabs } from "flowbite-react";
import { HiAdjustments, HiClipboardList } from "react-icons/hi";
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

const Coursedet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [studentData, setStudentData] = useState("");
  const [classData, setClassData] = useState("");
  const [allEnrollclassData, setAllClassData] = useState([]);
  const [feedetails, setFeeDetails] = useState(null);
  const [myenroll, setEnroll] = useState("");
  const [loading, setLoading] = useState(false);
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
      const response = await axios.get(
        "https://mentor-backend-rbac6.ondigitalocean.app/api/students/my-profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status == 200) {
        // console.log("studetails", response.data);
        const studentdetails = response.data;
        setStudentData(studentdetails);

        const classes = response.data.classes;
        // console.log("classes", classes)

        const allEnrClassData = [];
        for (const ids of classes) {
          const AllEnrollResponse = await axios.get(
            `https://mentor-backend-rbac6.ondigitalocean.app/api/students/all-courses/${ids}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (AllEnrollResponse.status === 200) {
            // console.log("allenrollids", AllEnrollResponse.data)
            const enroll = AllEnrollResponse.data;
            allEnrClassData.push(enroll);
            setEnroll(allEnrClassData); // Update state variable here instead of setEnroll
            // console.log("allenrolls", myenroll)
          }
        }

        const allEnrollClassData = [];
        const classResponse = await axios.get(
          `https://mentor-backend-rbac6.ondigitalocean.app/api/students/all-courses/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (classResponse.status === 200) {
          const classData = classResponse.data;
          // console.log("Enrolled class details:", classData);
          setClassData(classData);
          allEnrollClassData.push(classData);

          const teacherId = classResponse.data.teachBy;
          const teacherResponse = await axios.get(
            `https://mentor-backend-rbac6.ondigitalocean.app/api/students/teacher/${teacherId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (teacherResponse.status === 200) {
            // Add teacher information to class data
            classResponse.data.teacher = teacherResponse.data;
          }
        }

        setAllClassData(allEnrollClassData);
        // console.log("enroll class array", allEnrollclassData);
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

        const attendanceResponse = await axios.get(
          `https://mentor-backend-rbac6.ondigitalocean.app/api/students/my-attendance/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

        const FeeResponse = await axios.get(
          `https://mentor-backend-rbac6.ondigitalocean.app/api/students/my-fee-details/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (FeeResponse.status === 200) {
          // console.log("Fee details:", FeeResponse.data);
          const feeDetailsWithMonthNames = {
            ...FeeResponse.data,
            detailFee: FeeResponse.data.detailFee.map((fee) => ({
              ...fee,
              feeMonth: numberToMonthName[fee.feeMonth], // Convert month number to name
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
                    class="w-10 h-10 rounded-full"
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

                      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table class="w-full text-sm text-left rtl:text-right text-gray-500 ">
                          <tbody>
                            <tr class="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Student Name
                              </th>
                              <td class="px-6 py-4">{studentData?.name}</td>
                            </tr>
                            <tr class="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Course Tilte
                              </th>
                              <td class="px-6 py-4">{classData?.classTitle}</td>
                            </tr>
                            <tr class="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Teacher Name
                              </th>
                              <td class="px-6 py-4">
                                {classData.teacher?.name}
                              </td>
                            </tr>
                            <tr class="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Total Hours
                              </th>
                              <td class="px-6 py-4">
                                {classData?.totalHours} hours
                              </td>
                            </tr>
                            <tr class="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                              <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                              >
                                Course Price
                              </th>
                              <td class="px-6 py-4">
                                ₹ {feedetails?.totalFee}
                              </td>
                            </tr>
                            {/* <tr class="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                                                                Schedule
                                                            </th>
                                                            <td class="px-6 py-4">
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

                      <div class="overflow-auto max-h-96 overflow-x-auto shadow-md sm:rounded-lg">
                        <table class="w-full text-sm text-center rtl:text-right text-gray-500 ">
                          <thead class="sticky top-0 text-xs text-gray-100 uppercase bg-orange-400  ">
                            <tr>
                              <th scope="col" class="px-6 py-3">
                                Date
                              </th>
                              <th scope="col" class="px-6 py-3">
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
                                  <tr class="bg-white border-b  ">
                                    <th
                                      scope="row"
                                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
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

                      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table class="w-full text-sm text-left rtl:text-right text-gray-500 ">
                          <thead class="text-xs text-gray-100 uppercase bg-orange-400  ">
                            <tr>
                              <th scope="col" class="px-6 py-3">
                                Month
                              </th>
                              <th scope="col" class="px-6 py-3">
                                Amount
                              </th>
                              <th scope="col" class="px-6 py-3">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedetails &&
                              feedetails.detailFee.map((fee) => (
                                <tr class="bg-white border-b  ">
                                  <th
                                    scope="row"
                                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                  >
                                    {fee.feeMonth}
                                  </th>

                                  <th
                                    scope="row"
                                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
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
