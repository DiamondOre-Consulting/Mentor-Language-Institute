import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from "axios";


const TeacherAllStudents = () => {
    const navigate = useNavigate();
    const { selectedClassId } = useParams();
    const [eachcourse, setEachCourse] = useState("");
    const [alldetails, setAllDetails] = useState([]);
    const [attendanceDetailsMap, setAttendanceDetailsMap] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [studentId, setStudentId] = useState();
    const [stuids, setStuIds] = useState('');
    const [attendenceDetails, setAttendenceDetails] = useState(null);
    const [selectedstudentId, setSelectedStudentId] = useState(null)

    // console.log("Selected Class ID:", selectedClassId);


    useEffect(() => {

        const allDetails = async () => {

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    // No token found, redirect to login page
                    navigate("/login");
                    return;
                }

                const allsturesponse = await axios.get(`http://localhost:7000/api/teachers/class/all-students/${selectedClassId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });


                if (allsturesponse.status === 200) {
                    // console.log("allsturesponsedata", allsturesponse.data)
                    setAllDetails(allsturesponse.data);


                }


            }
            catch (error) {
                console.log(error)
                // setError('all students');
            }

        }



        allDetails();


    }, [selectedClassId])



    const fetchCourseDetails = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found");
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `http://localhost:7000/api/teachers/my-classes/${selectedClassId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                const courseData = response.data;
                setStudentId(courseData.enrolledStudents);
                setEachCourse(courseData.dailyClasses);



            }
        } catch (error) {
            console.log(error);
        }
    };



    const fetchAttendanceDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const attendanceDetailsMap = {};

            if (!token || !selectedClassId || !studentId) {
                console.error("Token, selectedClassId, or studentId not found");
                return;
            }
            if (!Array.isArray(studentId)) {
                console.error("StudentId is not an array");
                return;
            }
            for (const stu of studentId) {
                const attendanceResponse = await axios.get(
                    `http://localhost:7000/api/teachers/attendance/${selectedClassId}/${stu}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (attendanceResponse.status === 200) {
                    attendanceDetailsMap[stu] = attendanceResponse.data.detailAttendance;

                }
            }
            setAttendanceDetailsMap(attendanceDetailsMap);

            alldetails.forEach(student => {
                eachcourse.forEach(date => {
                    const attendanceDetail = attendanceDetailsMap[student._id]?.find(detail => detail.classDate === date);
                    const bgColorClass = determineBgColor(attendanceDetail);
                    console.log(bgColorClass);
                });
            });
        } catch (error) {
            console.log(error);
            return [];
        }
    };


    useEffect(() => {
        fetchAttendanceDetails();
        fetchCourseDetails();
    }, []);

    
    const [ShowMarkTodayAttendence, SetShowMarkTodayAttendence] = useState(false);
    const HandleCloseMarkedAttendence = () => {
        SetShowMarkTodayAttendence(false)
    };

    const handleDateClick = async (date, stuId) => {
        setSelectedDate(date);
        setShowPopup(true);
        setSelectedStudentId(stuId)
        const attendanceDetails = await fetchAttendanceDetails(stuId);
        setAttendenceDetails(attendanceDetails);
    };



    // console.log("stuid", studentId)

    const handleMarkAttendance = async (attendanceDate, attendanceStatus) => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !selectedClassId || selectedstudentId === null) { // Check if selectedstudentId is null
                console.error("Token, selectedClassId, or selectedstudentId not found");
                return;
            }


            const response = await axios.put(
                `http://localhost:7000/api/teachers/update-attendance/${selectedClassId}/${selectedstudentId}`,
                {
                    attendanceDate: selectedDate,
                    present: attendanceStatus === 'present'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setAttendanceDetailsMap(prevMap => {
                    const updatedMap = { ...prevMap };
                    const studentAttendanceDetails = updatedMap[selectedstudentId] || [];
                    const updatedAttendanceDetails = studentAttendanceDetails.map(detail => {
                        if (detail.classDate === attendanceDate) {
                            return { ...detail, present: attendanceStatus === 'present' };
                        }
                        return detail;
                    });
                    updatedMap[selectedstudentId] = updatedAttendanceDetails;
                    return updatedMap;
                });
                setShowPopup(false);
                console.log("attendence marked")

                // setAttendenceDetails(prevDetails => {
                //     const updatedDetails = prevDetails.map(detail => {
                //         if (detail.studentId === selectedstudentId) {
                //             return {
                //                 ...detail,
                //                 detailAttendance: detail.detailAttendance.map(attendance => {
                //                     if (attendance.classDate === selectedDate) {
                //                         return {
                //                             ...attendance,
                //                             present: attendanceStatus === 'present'
                //                         };
                //                     }
                //                     return attendance;
                //                 })
                //             };
                //         }
                //         return detail;
                //     });
                //     return updatedDetails;
                // });
            }
        } catch (error) {
            console.log(error);
        }

        setShowPopup(false);
    };

    const determineBgColor = (attendanceDetail) => {
        if (!attendanceDetail) return 'bg-gray-100'; // Default gray color if attendance details are not available

        if (attendanceDetail.present === true) {
            return 'bg-green-500';
        } else if (attendanceDetail.present === false) {
            return 'bg-red-500';
        } else if (attendanceDetail.present === null) {
            return 'bg-gray-200'; // Present is null
        }
    };
    // console.log(alldetails)

    const handleClose = () => {
        setShowPopup(false);
    };

    return (
        <>

            <h1 className='text-4xl mb-1 font-semibold text-start'>Enrolled Students</h1>
            <div className='w-44 rounded h-1 bg-orange-500 text-start mb-8 '></div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                {alldetails.map((student) => (
                    <div key={student.id}>
                        <div className="block max-w-sm bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                            <div className='px-4 pt-2'>
                                <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{student.name}</h5>
                                <p className="font-normal text-sm text-gray-700 dark:text-gray-400">Phone: <span>{student.phone}</span></p>
                            </div>
                            <div>
                                <p className='font-bold bg-orange-500 text-gray-100 mt-1 px-4 py-1 w-full'>Attendance</p>
                                <div className='h-32 overflow-y-auto'>
                                    <div className='grid grid-cols-3 gap-1' >
                                        {eachcourse && eachcourse.map((date, index) => {
                                            // Determine the background color based on attendance details for this student
                                            const attendanceDetail = attendanceDetailsMap[student._id]?.find(detail => detail.classDate === date);
                                            const bgColorClass = determineBgColor(attendanceDetail);

                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => handleDateClick(date, student._id)} // Pass student ID to handleDateClick
                                                    className={`border border-gray-300 bg-gray-100 text-xs px-2 py-2 cursor-pointer ${bgColorClass} shadow-md`}
                                                >
                                                    {date}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
                    <div className="relative bg-white p-6 rounded-lg shadow-xl">
                    <svg className="h-5 w-5 bg-red-600 cursor-pointer p-1 text-2xl rounded-full text-gray-50 absolute top-0 right-0 m-2" onClick={handleClose} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                        <p className="mb-4">Mark Attendance for {selectedDate}</p>
                        <button className="mr-4 bg-green-500 text-white px-4 py-2 rounded-md" onClick={() => handleMarkAttendance(selectedDate, 'present')}>Present</button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => handleMarkAttendance(selectedDate, 'absent')}>Absent</button>

                    </div>
                </div>
            )}




        </>
    )
}

export default TeacherAllStudents