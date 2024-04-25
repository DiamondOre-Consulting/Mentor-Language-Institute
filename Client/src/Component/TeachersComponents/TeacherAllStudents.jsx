import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from "axios";


const TeacherAllStudents = () => {
    const navigate = useNavigate();
    const { selectedClassId } = useParams();
    const [eachcourse, setEachCourse] = useState("");
    const [alldetails, setAllDetails] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [attendenceDetails, setAttendenceDetails] = useState(null);

    console.log("Selected Class ID:", selectedClassId);


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
                    console.log("allsturesponsedata", allsturesponse.data)
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

    // useEffect(() => {
    //     const fetchAttendanceDetails = async () => {
    //       try {

    //           const attendanceResponse = await axios.get(`http://localhost:7000/api/teachers/attendance/${selectedCourseId}/${id}`, {
    //             headers: {
    //               Authorization: `Bearer ${token}`,
    //             },
    //           });
    //           if (attendanceResponse.status === 200) {
    //             console.log("Attendance details:", attendanceResponse.data);
    //             setAttendenceDetails(attendanceResponse.data);
    //           }

    //       } catch (error) {
    //         console.error("Error fetching attendance details:", error);
    //       }
    //     };

    //     // Fetch attendance details when the selected course ID changes
    //     fetchAttendanceDetails();
    //   }, [ id, token]);

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

                // Iterate over each student ID
                for (const studentId of courseData.enrolledStudents) {
                    const attendanceResponse = await axios.get(
                        `http://localhost:7000/api/teachers/attendance/${selectedClassId}/${studentId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log("Attendance details for student", studentId, ":", attendanceResponse.data);
                    setAttendenceDetails(attendanceResponse.data)
                    // Process attendance details here
                }
            }
        } catch (error) {
            console.log(error);
        }
    };



    fetchCourseDetails();
    console.log(eachcourse);
    const [ShowMarkTodayAttendence, SetShowMarkTodayAttendence] = useState(false);
    const HandleCloseMarkedAttendence = () => {
        SetShowMarkTodayAttendence(false)
    };


    const handleDateClick = (date, studentId) => {
        setSelectedDate(date);
        setShowPopup(true);
        // Do something with the studentId, such as storing it in state
        // or passing it to another function
    };



    console.log("stuid", studentId)

    const handleMarkAttendance = async (attendanceDate, attendanceStatus) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                // Handle token not found
                return;
            }

            // Iterate over each student ID
            for (let id of studentId) {
                const response = await axios.put(
                    `http://localhost:7000/api/teachers/update-attendance/${selectedClassId}/${id}`,
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
                    // Log successful update
                    setEachCourse(prevCourses => prevCourses.map(course => {
                        if (course.date === date) {
                            course.attendanceStatus = attendanceStatus;
                        }
                        return course;
                    }));
                    // console.log(`Attendance marked for student with ID ${id}`);
                    navigate('/teacher-dashboard/')

                    // alert('Attendance marked for student with ID ');
                }
            }
        } catch (error) {
            console.log(error);
            // Handle error
        }

        setShowPopup(false);
    };

    return (
        <>

            <h1 className='text-4xl mb-1 font-semibold text-start'>Enrolled Students</h1>
            <div className='w-44 rounded h-1 bg-orange-500 text-start mb-8 '></div>

            <div className='grid grid-cols-2 gap-2'>
                {alldetails.length === 0 ? (
                    <div>No classes are there</div>
                ) : (
                    alldetails.map((student) => (
                        <div key={student.id}>
                            <div className="block max-w-sm bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                <div className='px-4 pt-2'>
                                    <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{student.name}</h5>
                                    <p className="font-normal text-sm text-gray-700 dark:text-gray-400">Phone: <span>{student.phone}</span></p>
                                </div>
                                <div>
                                    <p className='font-bold bg-orange-500 text-gray-100 mt-1 px-4 py-1 w-full'>Attendance</p>
                                    <div className='grid grid-cols-3 gap-1'>
                                        {eachcourse && eachcourse.map((atte, index) => {
                                            const attendanceDetail = attendenceDetails && attendenceDetails.detailAttendance.find(detail => detail.classDate === atte);
                                            // Determine the background color based on presentStatus
                                            let bgColorClass = '';
                                            if (attendanceDetail) {
                                                if (attendanceDetail.present === true) {
                                                    bgColorClass = 'bg-green-500';
                                                } else if (attendanceDetail.present === false) {
                                                    bgColorClass = 'bg-red-500';
                                                } else if (attendanceDetail.present === null) {
                                                    bgColorClass = 'bg-gray-200'; // Present is null
                                                }
                                            } else {
                                                bgColorClass = 'bg-gray-100'; // Default gray color if attendance details are not available
                                            }
                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => handleDateClick(atte, student.id)}
                                                    className={`border border-gray-300 bg-gray-100 text-sm px-4 py-2 cursor-pointer ${bgColorClass}  shadow-md`}
                                                >
                                                    {atte}
                                                </div>
                                            );
                                        })}

                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
                    <div className="relative bg-white p-6 rounded-lg shadow-xl">
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