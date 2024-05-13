
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useJwt } from "react-jwt";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;


const EachStu = () => {

  const [activeTab, setActiveTab] = useState('personal');
  const [classes, setAllClasses] = useState([]);
  const navigate = useNavigate();
  const [studentsDetails, setStudentsDetails] = useState(null);
  const { id } = useParams();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  const [attendenceDetails, setAttendenceDetails] = useState(null);
  const [feedetails, setFeeDetails] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [amount, setAmount] = useState('');
  const [paidStatus, setPaidStatus] = useState('');
  const [totafee , setTotalFee] = useState('');
  const [loading, setLoading] = useState(false);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


  useEffect(() => {
    const fetchStudentDetails = async () => {
      
      try {
        setLoading(true);
        // Fetch student details
        const studentResponse = await axios.get(`http://localhost:7000/api/admin-confi/all-students/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (studentResponse.status === 200) {
          // Set student details
          setStudentsDetails(studentResponse.data);
          
          // Fetch classes associated with the student
          const classIds = studentResponse.data.classes;
          const classesData = [];
          for (const classId of classIds) {
            const classResponse = await axios.get(`http://localhost:7000/api/admin-confi/all-classes/${classId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (classResponse.status === 200) {
              classesData.push(classResponse.data);
              
              // Fetch teacher associated with this class
              const teacherId = classResponse.data.teachBy;
              const teacherResponse = await axios.get(`http://localhost:7000/api/admin-confi/all-teachers/${teacherId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (teacherResponse.status === 200) {
                // Add teacher information to class data
                classResponse.data.teacher = teacherResponse.data;
              }
            }
          }
          // Set classes
          setAllClasses(classesData);
        }
      } catch (error) {
        console.log(error);
      }
      finally {
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


  // attendence 

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      setLoading(true)
      try {
        if (selectedCourseId) {
          const attendanceResponse = await axios.get(`http://localhost:7000/api/admin-confi/attendance/${selectedCourseId}/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (attendanceResponse.status === 200) {
            console.log("Attendance details:", attendanceResponse.data);
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
    12: "December"
  };


  useEffect(() => {
    const fetchFeeDetails = async () => {
      try {
        if (selectedCourseId) {
          const FeeResponse = await axios.get(`http://localhost:7000/api/admin-confi/fee/${selectedCourseId}/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (FeeResponse.status === 200) {
            console.log("Fee details:", FeeResponse.data);
            setTotalFee(FeeResponse.data.totalFee)
            const feeDetailsWithMonthNames = {
              ...FeeResponse.data,
              detailFee: FeeResponse.data.detailFee.map((fee) => ({
                ...fee,
                feeMonth: numberToMonthName[fee.feeMonth] // Convert month number to name
              }))
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
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
  };

  const handleFeeUpdate = async () => {
    try {

      if (!selectedMonth || !amount || !paidStatus) {
        alert("Please fill in all fields.");
        return;
      }

      const response = await axios.put(`http://localhost:7000/api/admin-confi/update-fee/${selectedCourseId}/${id}`, {
        feeMonth: monthNameToNumber[selectedMonth], 
        paid: paidStatus === "true",
        amountPaid: amount
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log("Fee updated successfully");
        const updatedFeeDetails = [...feedetails.detailFee];
        updatedFeeDetails.push({
          feeMonth: selectedMonth,
          amountPaid: amount,
          paid: paidStatus === "true"
        });
        setFeeDetails({ ...feedetails, detailFee: updatedFeeDetails });
        // Optionally, you can update the fee details state after successful update
      }
    } catch (error) {
      console.error("Error updating fee:", error);
    }
  };


console.log(classes)


  return (
    <>  {loading && (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
      </div>
  )}
        <div class="px-4 sm:px-1 lg:px-8">
          <h1 class=" text-3xl font-semibold  tracking-tight text-gray-900">
            {studentsDetails?.name}
          </h1>
          <p class="text-gray-500">{studentsDetails?.phone}</p>
        </div>

      <main>
        <div class="mt-4 md:mt-32 md:max-w-7xl py-0 ">
          <div class="flex flex-wrap  md:-mx-2  ">
            <div class="w-full mx-2 md:block lg:block md:-mt-24 sm:mt-0">

              <div class="block lg:block overflow-scroll md:overflow-hidden">
                <ul class="flex bg-white ">
                  <li class=" mr-1">
                    <a class="rounded-sm bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-orange-500 font-semibold shadow-md cursor-pointer"  onClick={() => handleTabClick('personal')}>Personal Information</a>
                  </li>
                  <li class="mr-1">
                    <a class="rounded-sm bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-orange-500 font-semibold cursor-pointer"  onClick={() => handleTabClick('EnrolledCourses')}>Enrolled Courses</a>
                  </li>
                  <li class="mr-1">
                    <a class="rounded-sm bg-white inline-block py-2 px-4 border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-orange-500 font-semibold cursor-pointer"  onClick={() => handleTabClick('FeeDetails')}>Fee Details</a>
                  </li>
                  <li class="mr-1">
                    <a class="rounded-sm bg-white inline-block py-2 px-4 border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-orange-500 font-semibold cursor-pointer"  onClick={() => handleTabClick('AttendanceDetails')}>Attendance Details</a>
                  </li>


                </ul>
              </div>
              {activeTab === 'personal' && (
                <div class="w-full mt-8 flex flex-col 2xl:w-1/3">
                  <div class="flex-1 bg-white rounded-lg shadow-xl p-8">
                    
                    <ul class="mt-2 text-gray-700">
                      <li class="flex border-y py-2">
                        <span class="font-bold w-24">Full name:</span>
                        <span class="text-gray-700">{studentsDetails?.name}</span>
                      </li>
                      <li class="flex border-b py-2">
                        <span class="font-bold w-24">phone:</span>
                        <span class="text-gray-700">{studentsDetails?.phone}</span>
                      </li>


                    </ul>
                  </div>

                </div>
              )}

              {
                activeTab === 'EnrolledCourses' && (
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2 bg-white pt-10 '>
                    {classes.length === 0 ? (
                      <div>No classes are there</div>
                    ) : (
                      classes.map((course) => (
                        <a  class="block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                          <h5 class="mb-2 text-md md:text-xl font-bold tracking-tight text-gray-900 dark:text-white">{course?.classTitle}</h5>
                          {/* <p class="font-normal text-sm text-gray-700 dark:text-gray-400">classSchedule:- <span>{course?.classSchedule}</span></p> */}
                          <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Duration :- <span>{course?.totalHours}</span></p>
                          <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Teach By :- <span>{course?.teacher ? course.teacher.name : 'Unknown'}</span></p>
                        </a>
                      ))
                    )}
                  </div>
                )
              }


              {
                activeTab === 'FeeDetails' && (

                  <div className='bg-white pt-10'>
                    <select onChange={handleCourseSelection}>
                      <option value="">Select Course</option>
                      {classes.map(course => (
                        <option key={course._id} value={course._id}>{course.classTitle}</option>
                      ))}
                    </select>

                    <div>


                      <div class="relative overflow-x-auto mt-8">
                        <span className=" mb-1 float-right rounded-md  mr-3">Total Fee:- {totafee}</span>
                        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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

                            {feedetails && feedetails.detailFee.map((fee) => (
                              <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  {fee.feeMonth}
                                </th>

                                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  {fee.amountPaid}
                                </th>

                                <td className={`px-6 py-4 ${fee.paid ? 'text-green-500' : 'text-red-400'}`}>
                                  {fee.paid ? 'Submitted' : 'Due'}
                                </td>
                              </tr>


                            ))}

                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <select className="" onChange={(e) => setSelectedMonth(e.target.value)}>
                                  <option>Select Month</option>
                                  {months.map((month, index) => (
                                    <option key={index} value={month}>{month}</option>
                                  ))}
                                </select>
                              </td>

                              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <input type="text" className="" placeholder="Enter Amount" value={amount} onChange={(e) => setAmount(e.target.value)}></input>
                              </td>

                              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <select value={paidStatus} onChange={(e) => setPaidStatus(e.target.value)}>
                                  <option>Select Status</option>
                                  <option value="true">True</option>


                                </select>
                                <button className="bg-green-600 text-gray-200 py-2 px-4 ml-2 rounded-md" onClick={handleFeeUpdate}>Update Fee</button>
                              </td>
                            </tr>

                          </tbody>
                        </table>
                      </div>

                    </div>
                  </div>



                )
              }

              {

                // person will select course the month the date come when the enrolld and thart month make the logic if sunday hai to write sunday
                activeTab === 'AttendanceDetails' && (

                  <div className='bg-white pt-10'>
                    <div className='flex '>
                      <select onChange={handleCourseSelection}>
                        <option value="">Select Course</option>
                        {classes.map(course => (
                          <option key={course._id} value={course._id}>{course.classTitle}</option>
                        ))}
                      </select>


                    </div>

                    <div>


                      <div class="relative overflow-x-auto mt-8">
                        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th scope="col" class="px-6 py-3">
                                Date
                              </th>
                              <th scope="col" class="px-6 py-3">
                                Status
                              </th>

                            </tr>
                          </thead>
                          <tbody>
                            {attendenceDetails && attendenceDetails.detailAttendance.map((attendance) => (
                              <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  {attendance.classDate}
                                </th>
                                <td className={`px-6 py-4`}>
                                {attendance.numberOfClassesTaken}
                                </td>
                              </tr>
                            ))}


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
  )
}

export default EachStu