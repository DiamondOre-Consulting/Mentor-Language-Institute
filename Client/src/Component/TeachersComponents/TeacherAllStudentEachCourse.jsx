import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Select } from 'flowbite-react';
import { decodeToken } from 'react-jwt';
import { useJwt } from 'react-jwt'
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

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
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [numberOfClasses, setNumberOfClasses] = useState('');
    const [selectedstudentId, setSelectedStudentId] = useState(null);
    const [numberOfClassesTaken, setNumberOfClassesTaken] = useState("");
    const [studentDetails, setStudentsDetails] = useState([]);
    const [myenrolledStudentDetails, setMyEnrolledStudentsDetails] = useState([]);
    const [attendanceDetails, setAttendanceDetails] = useState([]);
    const [monthCommissionDetails, setMonthlyCommissionDetails] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [monthlyClassTaken, setMonthlyClassTaken] = useState('');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032"];




    // useEffect(() => {
    //     const allDetails = async () => {
    //         try {
    //             const token = localStorage.getItem('token');
    //             if (!token) {
    //                 navigate('/login');
    //                 return;
    //             }

    //             const allStudentsResponse = await axios.get(`https://api.mentorlanguageinstitute.com/api/teachers/class/all-students/${selectedClassId}`, {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });

    //             if (allStudentsResponse.status === 200) {
    //                 setAllDetails(allStudentsResponse.data);
    //                 console.log("alldetaiils", allStudentsResponse.data);
    //             }

    //         } catch (error) {
    //             console.log(error);
    //         }

    //     };

    //     allDetails();
    // }, [selectedClassId, navigate]);

    useEffect(() => {

        const fetchCourseDetails = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    console.error('No token found');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`https://api.mentorlanguageinstitute.com/api/teachers/my-classes/${selectedClassId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    const courseData = response.data;
                    setCourseDetails(response.data);
                    setStudentId(courseData.enrolledStudents);
                    console.log("course details", response.data)
                    const enrolledStudents = courseData.enrolledStudents;
                    const enrolledStudentsDetails = [];

                    for (const studentIds of enrolledStudents) {
                        const studentResponse = await axios.get(
                            `https://api.mentorlanguageinstitute.com/api/teachers/student/${studentIds}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (studentResponse.status === 200) {
                            const studentData = studentResponse.data;
                            console.log("Enrolled student details:", studentData);
                            enrolledStudentsDetails.push(studentData);
                            setMyEnrolledStudentsDetails(enrolledStudentsDetails);
                            setLoading(false);
                        }
                    }


                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }

        };
        fetchCourseDetails();
    }, [selectedClassId, navigate])



    // fetch attendence details
    useEffect(() => {
        const fetchAttendanceDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                // setLoading(true);
                if (!token) {
                    console.error('Token not found');
                    return;
                }

                const attendanceResponse = await axios.get(`https://api.mentorlanguageinstitute.com/api/teachers/attendance/${selectedClassId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        attendanceDate: selectedDate, // Pass attendanceDate as a query parameter
                    },
                });

                if (attendanceResponse.status === 200) {
                    console.log("a det", attendanceResponse.data)

                    const mapping = attendanceResponse.data
                        .filter(item => item.detailAttendance)
                        .map(item => item.detailAttendance);

                    const numberOfClassesTakenValues = mapping.map(detailAttendance =>
                        detailAttendance.map(detail => detail.numberOfClassesTaken)
                    );
                    setAttendanceDetails(attendanceResponse.data);

                    console.log("mapping", mapping)
                    console.log("mapping", numberOfClassesTakenValues)

                    const studentIds = attendanceResponse.data.map(item => item.studentId);
                    console.log("student ids", studentIds)
                    const studentData = [];
                    for (const studentid of studentIds) {

                        const studentResponse = await axios.get(`https://api.mentorlanguageinstitute.com/api/teachers/student/${studentid}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        if (studentResponse.status === 200) {
                            const data = studentResponse.data
                            studentData.push(data)

                            console.log("allstudents details", studentDetails)
                        }


                    } setStudentsDetails(studentData);

                    setAttendanceDetailsMap({});
                }
            } catch (error) {
                console.log("Error in fetching attendance:", error);
            } 
        };

        // Call fetchAttendanceDetails when selectedDate or selectedClassId changes
        fetchAttendanceDetails();
    }, [selectedDate, selectedClassId]);

    const handleFetchStudentDetails = (studentId, studentName) => {
        console.log('Student ID:', studentId);
        console.log('Student Name:', studentName);
        setSelectedStudentName(studentName);
        setSelectedStudentId(studentId)

        setNumberOfClassesTaken(attendanceDetailsMap[studentId]?.numberOfClassesTaken || 0);
        setShowPopup(true);
    };

    const handleDateChange = (event) => {
        const selectedDate = event.target.value;
        const selectedDateObj = courseDetails.dailyClasses.find(date => date.classDate === selectedDate);
        if (selectedDateObj) {
            setSelectedDate(selectedDate);
            setNumberOfClasses(selectedDateObj.numberOfClasses); // Access the number of classes from the selected date object
        }
    };


    // update atendence 

    const updateAttendance = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("no Token Found")
                navigate('/login');
            }
            if (!selectedDate) {
                alert("Please select a date first.");
                return;
            }

            const response = await axios.put(
                `https://api.mentorlanguageinstitute.com/api/teachers/update-attendance/${selectedClassId}/${selectedstudentId}`,
                {
                    attendanceDate: selectedDate,
                    numberOfClassesTaken
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log(response.data);
                console.log("attendence marked ")
                setShowPopup(false)
                setAttendanceDetailsMap(prevAttendanceDetailsMap => ({
                    ...prevAttendanceDetailsMap,
                    [selectedstudentId]: numberOfClassesTaken
                }));

            }

        }
        catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }

    }




    //  get monthly commission 
    useEffect(() => {
        const getMonthlyCommission = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // const commission = [];

                const monthlyCommissionReport = await axios.get(`https://api.mentorlanguageinstitute.com/api/teachers/my-commission`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (monthlyCommissionReport.status === 200) {
                    setMonthlyCommissionDetails(monthlyCommissionReport.data);
                    console.log("monthlycommission", monthlyCommissionReport.data);
                }


            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

        getMonthlyCommission();
    }, [selectedClassId]);

    console.log(monthCommissionDetails)
    // update monthly commission 
    const updateMonthlyCommission = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("no Token Found")
                navigate('/login');
            }
            if (!selectedMonth || !selectedYear || !monthlyClassTaken) {
                alert("Please fill in all fields.");
                return;
            }

            const response = await axios.post(
                `https://api.mentorlanguageinstitute.com/api/teachers/add-monthly-classes/${selectedClassId}`,
                {
                    monthName: selectedMonth,
                    year: selectedYear,
                    classesTaken: monthlyClassTaken
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log(response.data);
                console.log("Teacher update monthly commission")
                window.location.reload();


                // Clear the input fields
                setSelectedMonth('');
                setSelectedYear('');
                setMonthlyClassTaken('');





            }

        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    }


    return (
        <div className='p-4'>

            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
                </div>
            )}
            <h1 className="text-4xl mb-1 font-semibold text-start text-gray-700 mt-10 md:mt-0">{courseDetails.classTitle}   |  Total Hours:  {courseDetails.totalHours}</h1>

            <div class="relative overflow-x-auto  mt-8">
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
                <div className='flex items-center '>
                    <div>
                        <select onChange={handleDateChange}>
                            <option>Select Date</option>
                            {courseDetails.dailyClasses && courseDetails.dailyClasses.map((date) => {
                                return (
                                    <option key={date._id}>{date.classDate}</option>
                                );
                            })}
                        </select>
                    </div>
                    <div className='ml-6'>
                        {selectedDate && (
                            <div className='ml-4'>
                                <div className='border-2 bg-gray-100 rounded-md border px-12 py-2' value={numberOfClasses}>
                                    <span>{numberOfClasses}</span>
                                </div>

                            </div>
                        )}
                    </div>
                </div>



                <div className='grid grid-cols-1 md:grid-cols-1 gap-8 mt-10'>
                    <table class="w-full text-sm text-center rtl:text-right text-gray-500  shadow-xl">
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


                            </tr>
                        </thead>
                        <tbody>
                            {
                                studentDetails.map((student, index) => {
                                    console.log(`Object at index ${index}:`, student);

                                    // Find the attendance details for the current student
                                    const studentAttendanceDetails = attendanceDetails.find(attendance => attendance.studentId === student._id);
                                    const studentTotalClassesTaken = studentAttendanceDetails ? studentAttendanceDetails.detailAttendance
                                        .filter(detail => detail.classDate === selectedDate) // Filter by selected date
                                        .reduce((total, detail) => total + (+detail.numberOfClassesTaken || 0), 0) : 0;
                                    const showEditIcon = studentTotalClassesTaken === 0;


                                    const teachercommission = studentAttendanceDetails ? studentAttendanceDetails.detailAttendance
                                        .filter(details => details.classDate === selectedDate)
                                        .reduce((totalCommission, detail) => totalCommission + detail.commission, 0) : 0;

                                    return (
                                        <tr key={student._id} class="bg-white border-b   ">
                                            <th scope="row" class="  flex items-center pl-6 pr-14  md:pl-6 md:pr-6 py-4 text-gray-900 whitespace-nowrap bg-orange-50">
                                                <img class="w-6 h-6 md:w-10 md:h-10 rounded-full" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc3hMXsYcyINCaXkRBhVyEjHMQszmNStck2ELBWXKUYw&s" alt="Jese image" />
                                                <div class="ps-3">
                                                    <div class="text-base font-semibold">{student.name}</div>
                                                    <div class="font-normal text-gray-500">{student.phone}</div>
                                                </div>
                                            </th>
                                            <td class="px-6 py-4 text-center cursor-pointer hover:bg-gray-50">

                                                <div className='flex items-center justify-center'>
                                                    {showEditIcon ? (
                                                        <svg onClick={() => handleFetchStudentDetails(student._id, student.name)} class="h-6 w-6 text-red-600" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />  <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" /></svg>

                                                    ) : (
                                                        <div>{studentTotalClassesTaken}</div>
                                                    )}
                                                </div>

                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                {teachercommission}
                                            </td>
                                        </tr>
                                    );
                                })
                            }


                        </tbody>

                    </table>

                    <h1 className='text-3xl mt-4 '>Monthly Commission</h1>

                    <table class="w-full text-sm text-center rtl:text-center text-gray-500  shadow-xl rounded-md">
                        <thead class="text-xs text-gray-100 uppercase bg-orange-500 rounded-md ">
                            <tr>

                                <th scope="col" class="px-6 py-3">
                                    Month
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Year
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Classes Taken
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    commission
                                </th>


                                <th scope="col" class="px-6 py-3">
                                    Paid
                                </th>

                                <th scope="col" class="px-6 py-3">
                                    Remarks(if any)
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    submit
                                </th>

                            </tr>
                        </thead>
                        <tbody>
                            {monthCommissionDetails && monthCommissionDetails.map((commission, index) => (
                                <tr key={index} className="bg-white border-b   hover:bg-gray-50 cursor-pointer">
                                    <td className="px-6 py-4 text-center">{commission.monthName}</td>
                                    <td className="px-6 py-4 text-center">{commission.year}</td>
                                    <td className="px-6 py-4 text-center">{commission.classesTaken}</td>
                                    <td className="px-6 py-4 text-center">{commission.commission}</td>
                                    <td className={`px-6 py-4 text-center ${commission.paid ? 'text-green-500 font-bold' : 'text-red-400'}`}>{commission.paid ? "paid" : "Unpaid"}</td>
                                    <td className="px-6 py-4 text-center text-sm">{commission.remarks}</td>
                                </tr>
                            ))}

                            <tr className="bg-white border-b  ">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                                    <select className="" onChange={(e) => setSelectedMonth(e.target.value)}>
                                        <option>Select Month</option>
                                        {months.map((month, index) => (
                                            <option key={index} value={month}>{month}</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap ">
                                    <select className="" onChange={(e) => setSelectedYear(e.target.value)}>
                                        <option>Select Year</option>
                                        {years.map((year, index) => (
                                            <option key={index} value={year}>{year}</option>
                                        ))}
                                    </select>

                                </td>

                                <td className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap ">
                                    <input type="text" className="" placeholder="Monthly Classes" value={monthlyClassTaken} onChange={(e) => setMonthlyClassTaken(e.target.value)}></input>
                                    {/* <button className="bg-green-600 text-gray-200 py-2 px-4 ml-2 rounded-md" >Update Fee</button> */}
                                </td>


                                <td className='px-6 py-4 text-center'>
                                    0
                                </td>

                                <td className='px-6 py-4 text-center'>
                                    Unpaid
                                </td>
                                <td className='px-6 py-4 text-center'>

                                </td>
                                <td className='px-2 py-4 text-center'>
                                    <button className="bg-green-600 text-gray-200 py-1 px-2 ml-2 rounded-md" onClick={updateMonthlyCommission} >Update</button>
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

                            <input
                                type="text"
                                value={numberOfClassesTaken}
                                onChange={(e) => setNumberOfClassesTaken(e.target.value)}
                                className="w-full "
                                placeholder="Enter Number of Classes Taken"
                            />

                            <button className='bg-green-500 p-2 text-gray-100 ' onClick={updateAttendance}>Update</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default TeacherAllStudentEachCourse