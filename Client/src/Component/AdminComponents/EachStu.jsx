
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useJwt } from "react-jwt";


const EachStu = () => {

  const [activeTab, setActiveTab] = useState('personal');
  const [classes, setAllClasses] = useState([]);
  const navigate = useNavigate();
  const [studentsDetails, setStudentsDetails] = useState(null);
  const { id } = useParams();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  const [attendenceDetails, setAttendenceDetails] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect to login page if not authenticated
      return;
    }

    const fetchStudentDetails = async () => {
      try {
        const studentResponse = await axios.get(`http://localhost:7000/api/admin-confi/all-students/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (studentResponse.status === 200) {
          setStudentsDetails(studentResponse.data);

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
            }
          }

          setAllClasses(classesData);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchStudentDetails();
  }, [id, token, navigate]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleCourseSelection = (event) => {
    setSelectedCourseId(event.target.value);
  };

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
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
      }
    };

    // Fetch attendance details when the selected course ID changes
    fetchAttendanceDetails();
  }, [selectedCourseId, id, token]);


  return (
    <>
      <div class="bg-orange-500 flex justify-between">
        <div class=" w-48 h-48  max-w-7xl px-4 py-10 bg-orange-500 sm:px-6 lg:px-8 hidden lg:block md:block">

          {/* <img class=" flex-1 w-48 h-48 rounded-full shadow-lg" src="https://static.independent.co.uk/2023/09/14/15/WOLFPACK_Gallery_Kristin_10232022_FO_0064_aprRT.jpg?width=1200&height=1200&fit=crop" alt=""/> */}
        </div>
        <div class="bg-orange-500  max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 class=" text-3xl font-semibold  tracking-tight text-gray-100">
            {studentsDetails?.name}
          </h1>
          <p class="ml-10 text-gray-200">{studentsDetails?.phone}</p>
        </div>

        <div class="bg-orange-500 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div class="flex justify-between">


            <div class="flex-1">

            </div>


          </div>

        </div>

      </div>
      <main>
        <div class=" max-w-7xl py-0 ">
          <div class="md:flex no-wrap md:-mx-2  ">

            <div class="w-full mx-2   md:block lg:block md:-mt-24 sm:mt-0">

              <div class="hidden md:block lg:block">
                <ul class="flex bg-white ">
                  <li class=" mr-1">
                    <a class="rounded-sm bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-700 font-semibold shadow-md" href="#" onClick={() => handleTabClick('personal')}>Personal Information</a>
                  </li>
                  <li class="mr-1">
                    <a class="rounded-sm bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold" href="#" onClick={() => handleTabClick('EnrolledCourses')}>Enrolled Courses</a>
                  </li>
                  <li class="mr-1">
                    <a class="rounded-sm bg-white inline-block py-2 px-4 border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold" href="#" onClick={() => handleTabClick('FeeDetails')}>Fee Details</a>
                  </li>
                  <li class="mr-1">
                    <a class="rounded-sm bg-white inline-block py-2 px-4 border-l border-t border-r rounded-t py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold" href="#" onClick={() => handleTabClick('AttendenceDetails')}>Attendence Details</a>
                  </li>


                </ul>
              </div>
              {activeTab === 'personal' && (
                <div class="w-full flex flex-col 2xl:w-1/3">
                  <div class="flex-1 bg-white rounded-lg shadow-xl p-8">
                    <h4 class="text-xl text-gray-900 font-bold">Personal Info</h4>
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
                  <div className='grid grid-cols-4 gap-2 bg-white pt-10 '>
                    {classes.length === 0 ? (
                      <div>No classes are there</div>
                    ) : (
                      classes.map((course) => (
                        <a href="#" class="block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{course?.classTitle}</h5>
                          <p class="font-normal text-sm text-gray-700 dark:text-gray-400">classSchedule:- <span>{course?.classSchedule}</span></p>
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
                    <select>
                      <option>Select Course</option>
                      <option>HTML </option>
                      <option>CSS</option>
                      <option>JAVASCRIPT</option>
                    </select>

                    <div>


                      <div class="relative overflow-x-auto mt-8">
                        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th scope="col" class="px-6 py-3">
                                Month
                              </th>
                              <th scope="col" class="px-6 py-3">
                                Status
                              </th>

                            </tr>
                          </thead>
                          <tbody>
                            {

                            }
                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                              <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                Adminssion Fee
                              </th>
                              <td class="px-6 py-4 text-green-500">
                                Submitted
                              </td>

                            </tr>
                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                              <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                March
                              </th>
                              <td class="px-6 py-4 text-red-400">
                                Due
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
                activeTab === 'AttendenceDetails' && (

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
                                <td className={`px-6 py-4 ${attendance.present ? 'text-green-500' : 'text-red-400'}`}>
                                  {attendance.present ? 'Present' : 'Absent'}
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