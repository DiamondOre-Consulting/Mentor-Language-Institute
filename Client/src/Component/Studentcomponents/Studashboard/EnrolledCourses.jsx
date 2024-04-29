import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const EnrolledCourses = () => {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [classData, setClassData] = useState([])

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    // Token not found in local storage, handle the error or redirect to the login page
                    console.error("No token found");
                    navigate("/login");
                    return;
                }

                // Fetch associates data from the backend
                const response = await axios.get(
                    "http://localhost:7000/api/students/my-profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.status == 200) {
                    console.log(response.data.classes);

                    const classes = response.data.classes;
                    const allClassData = [];

                    for (const classId of classes) {

                        const classResponse = await axios.get(
                            `http://localhost:7000/api/students/all-courses/${classId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (classResponse.status === 200) {
                            const classData = classResponse.data;
                            console.log("Enrolled class details:", classData);
                            allClassData.push(classData);
                        }
                    }
                    setClassData(allClassData);

                } else {
                    console.log(response.data);

                }
            } catch (error) {
                console.error("Error fetching student data:", error);

            }
        };

        fetchStudentData();
    }, [])

    return (
        <>
            <div className='px-10 mt-8'>
                <h1 className='text-4xl font-bold text-gray-900'>Enrolled Courses</h1>

                <div className='grid grid-cols-4 gap-8 py-20'>
                    {classData.length === 0 ? (
                        <p className='text-center font-bold bg-orange-400 p-4 flex items-center justify-center text-gray-200 rounded-md'>No Enrolled Courses are there</p>
                    ) : (
                        classData.map((course) => (
                            <div key={course._id} className='grid grid-cols-4 gap-2  border rounded-md shadow-lg border-0'>

                                <div  className='px-4 py-3 col-span-3 bg-orange-500 rounded-l-md'>
                                    <span className='text-sm text-white'>Course</span>
                                    <p className='text-xl font-bold text-white'>{course.classTitle}</p>
                                    <Link to={`/student-each-course/${course._id}`} className='text-gray-100 flex items-center  text-md mt-4 justify-end'>View <svg className="h-4 w-4 text-gray-100" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" /><polyline points="9 6 15 12 9 18" /></svg></Link>
                                </div>

                                <div className='flex justify-center border border-0'>
                                    <div className='w-1 h-full bg-orange-500'></div>
                                </div>
                            </div>
                        ))
                    )}

                </div>

            </div>
        </>
    )
}

export default EnrolledCourses