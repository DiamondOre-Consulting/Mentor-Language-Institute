import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Select } from 'flowbite-react';

const TeacherAllStudentEachCourse = () => {

    const navigate = useNavigate();
    const { selectedClassId } = useParams();
    const [allDetails, setAllDetails] = useState([]);
    const [courseDetails, setCourseDetails] = useState([]);
    const [attendanceDetailsMap, setAttendanceDetailsMap] = useState({});
    const [studentId, setStudentId] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedStudentName, setSelectedStudentName] = useState('');


    useEffect(() => {
        const allDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const allStudentsResponse = await axios.get(`http://localhost:7000/api/teachers/class/all-students/${selectedClassId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (allStudentsResponse.status === 200) {
                    setAllDetails(allStudentsResponse.data);
                    console.log("alldetaiils", allStudentsResponse.data);
                }

            } catch (error) {
                console.log(error);
            }

        };

        allDetails();
    }, [selectedClassId, navigate]);

    useEffect(() => {

        const fetchCourseDetails = async () => {
            try {

                const token = localStorage.getItem('token');

                if (!token) {
                    console.error('No token found');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`http://localhost:7000/api/teachers/my-classes/${selectedClassId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    const courseData = response.data;
                    setCourseDetails(response.data);
                    setStudentId(courseData.enrolledStudents);
                    console.log("course details", response.data)

                }
            } catch (error) {
                console.log(error);
            }

        };
        fetchCourseDetails();
    }, [selectedClassId, navigate])


    useEffect(() => {
        const fetchAttendanceDetails = async () => {
            try {
                // setLoading(true)
                const token = localStorage.getItem('token');
                const attendanceDetailsMap = {};

                if (!token || !selectedClassId || !studentId) {
                    console.error('Token, selectedClassId, or studentId not found');
                    return;
                }

                if (!Array.isArray(studentId)) {
                    console.error('StudentId is not an array');
                    return;
                }

                for (const stu of studentId) {
                    const attendanceResponse = await axios.get(`http://localhost:7000/api/teachers/attendance/${selectedClassId}/${stu}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (attendanceResponse.status === 200) {
                        attendanceDetailsMap[stu] = attendanceResponse.data.detailAttendance;
                        console.log("attendenc details", attendanceResponse.data)
                        // setLoading(false); 
                    }
                }

                setAttendanceDetailsMap(attendanceDetailsMap);

                // setLoading(false); 
            } catch (error) {
                console.log(error);
            }

        };

        fetchAttendanceDetails();
    }, [selectedClassId, studentId]);

    const handleFetchStudentDetails = (studentId, studentName) => {
        console.log('Student ID:', studentId);
        console.log('Student Name:', studentName);
        setSelectedStudentName(studentName);
        setShowPopup(true ,studentName);
    };

    return (
        <>
            <h1 className="text-4xl mb-1 font-semibold text-start text-gray-700">{courseDetails.classTitle}   |  Total Hours:  {courseDetails.totalHours}</h1>

            <div class="relative overflow-x-auto  mt-8">
                {/* <div class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">

                    <label for="table-search" class="sr-only">Search</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="text" id="table-search-users" class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for users" />
                    </div>
                </div> */}
                <div className='flex items-center '>
                    <div>
                        <Select>
                            <option>Select Date</option>
                            {courseDetails.dailyClasses && courseDetails.dailyClasses.map((date) => {
                                return (
                                    <option key={date}>{date}</option>
                                );
                            })}
                        </Select>
                    </div>
                    <div className='ml-6'>
                        <Select>
                            <option>Select</option>
                        </Select>
                    </div>
                </div>

                

                <div className='grid grid-cols-1 md:grid-cols-1 gap-8 mt-10'>
                    <table class="w-full text-sm text-left rtl:text-right text-gray-500  shadow-xl">
                        <thead class="text-xs text-gray-100 uppercase bg-orange-500 ">
                            <tr>

                                <th scope="col" class="px-6 py-3">
                                    Name
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Classes Taken
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Commission
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Total Classes Taken
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Total Commission
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                allDetails.map((student) => {
                                    return (
                                        <tr key={student.id} class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 ">
                                            <th scope="row" class="  flex items-center pl-6 pr-14  md:pl-6 md:pr-6 py-4 text-gray-900 whitespace-nowrap bg-orange-50">
                                                <img class="w-6 h-6 md:w-10 md:h-10 rounded-full" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc3hMXsYcyINCaXkRBhVyEjHMQszmNStck2ELBWXKUYw&s" alt="Jese image" />
                                                <div class="ps-3">
                                                    <div class="text-base font-semibold">{student.name}</div>
                                                    <div class="font-normal text-gray-500">{student.phone}</div>
                                                </div>
                                            </th>
                                            <td class="px-6 py-4 text-center cursor-pointer hover:bg-gray-50">
                                                <div className='flex items-center justify-center'onClick={() => handleFetchStudentDetails(student._id, student.name)}>
                                                    <div> 12.5 </div>
                                                    <div className='ml-2'><svg class="h-6 w-6 text-red-600" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />  <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" /></svg></div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                ₹ 20,000
                                            </td>
                                        </tr>
                                    );
                                })
                            }


                        </tbody>

                    </table>

                    <h1 className='text-3xl mt-4 '>Monthly Commission</h1>

                    <table class="w-full text-sm text-center rtl:text-center text-gray-500 dark:text-gray-400 shadow-xl rounded-md">
                        <thead class="text-xs text-gray-100 uppercase bg-orange-500 rounded-md ">
                            <tr>

                                <th scope="col" class="px-6 py-3">
                                    Month
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Classes Taken
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    commission
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Arrear
                                </th>

                                <th scope="col" class="px-6 py-3">
                                    Paid
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    OutStanding
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Remarks(if any)
                                </th>

                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-white border-b  ">

                                <th scope="row" class="px-6 py-4e text-bold bg-orange-50">
                                    January
                                </th>
                                <td class="px-6 py-4 text-center">
                                    <div className='flex items-center justify-center'>
                                        <div> 12.5 </div>
                                        <div className='ml-2'><svg class="h-6 w-6 text-red-600" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />  <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" /></svg></div>
                                    </div>
                                </td>

                                <td className='px-6 py-4 text-center'>
                                    ₹ 7000
                                </td>

                                <td className='px-6 py-4 text-center'>
                                    <svg class="h-8 w-8 text-green-600" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M7 12l5 5l10 -10" />  <path d="M2 12l5 5m5 -5l5 -5" /></svg>
                                </td>
                                <td className='px-6 py-4 text-center'>
                                    Yes
                                </td>
                                <td className='px-6 py-4 text-center'>
                                    ₹ 7000
                                </td>
                                <td className='px-6 py-4 text-center'>

                                </td>


                            </tr>


                        </tbody>
                    </table>
                </div>

            </div>

             {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-800 opacity-50"></div>

                    <div className="relative bg-white p-6 rounded-lg shadow-xl">
                        <svg className="h-5 w-5 bg-red-600 cursor-pointer p-1 text-2xl -mb-1 rounded-full text-gray-50 absolute top-0 right-0 m-2" onClick={() => setShowPopup(false)} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                        <p className="mb-4 font-bold text-xl">{selectedStudentName}</p>
                        <div className='flex items-center'>
                            <input type='number' placeholder=' classes Taken'/>
                            <button className='bg-green-500 p-2 text-gray-100 '>Update</button>
                        </div>
                    </div>
                </div>
            )} 

        </>
    )
}

export default TeacherAllStudentEachCourse