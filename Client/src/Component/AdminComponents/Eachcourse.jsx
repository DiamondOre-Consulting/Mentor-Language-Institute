
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useJwt } from "react-jwt";


const Eachcourse = () => {

    const navigate = useNavigate();
    const [courseDetails, setCourseDetails] = useState(null);



    const { id } = useParams();
    console.log(id);

    const { decodedToken } = useJwt(localStorage.getItem("token"));
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }



    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // No token found, redirect to login page
            navigate("/login");
        } else {
            const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds

            if (tokenExpiration && tokenExpiration < Date.now()) {
                // Token expired, remove from local storage and redirect to login page
                localStorage.removeItem("token");
                navigate("/login");
            }
        }

        const fetchCourseDetails = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    // Token not found in local storage, handle the error or redirect to the login page
                    console.error("No token found");
                    navigate("/login");
                    return;
                }

                // Fetch course details
                const response = await axios.get(
                    `http://localhost:7000/api/admin-confi/all-classes/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    const courseData = response.data;
                    console.log("Course details:", courseData);

                    // Fetch teacher details
                    const teacherId = courseData.teachBy;
                    const teacherResponse = await axios.get(
                        `http://localhost:7000/api/admin-confi/all-teachers/${teacherId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (teacherResponse.status === 200) {
                        const teacherData = teacherResponse.data;
                        console.log("Teacher details:", teacherData);
                        courseData.teacher = teacherData;
                    }

                    // Fetch details of enrolled students
                    const enrolledStudents = courseData.enrolledStudents;
                    const enrolledStudentsDetails = [];

                    for (const studentId of enrolledStudents) {
                        const studentResponse = await axios.get(
                            `http://localhost:7000/api/admin-confi/all-students/${studentId}`,
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
                        }
                    }

                    // Set course details including teacher and enrolled students
                    setCourseDetails({
                        ...courseData,
                        enrolledStudents: enrolledStudentsDetails,
                    });
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchCourseDetails();
    }, [decodedToken]);


    return (
        <>
            <div>
                <h1 className='text-2xl font-bold '>{courseDetails?.classTitle}</h1>
                <div class="grid grid-cols-2 gap-4 2xl:w-1/3">
                    <div class="flex-1  bg-white rounded-lg shadow-xl p-8">
                        <h4 class="text-xl text-gray-900 font-bold">Course Details</h4>
                        <ul class="mt-2 text-gray-700">
                            <li class="flex border-y py-2">
                                <span class="font-bold w-32">Schedule:</span>
                                <span class="text-gray-700">{courseDetails?.classSchedule}</span>
                            </li>
                            <li class="flex border-b py-2">
                                <span class="font-bold w-32">Total Hourse:</span>
                                <span class="text-gray-700">{courseDetails?.totalHours}</span>
                            </li>
                            <li class="flex border-b py-2">
                                <span class="font-bold w-32">Created At:</span>
                                <span class="text-gray-700">{courseDetails?.createdAt}</span>
                            </li>



                        </ul>
                    </div>
                    <div class="flex-1  bg-white rounded-lg shadow-xl p-8">
                        <h4 class="text-xl text-gray-900 font-bold">Teacher Details</h4>
                        <ul class="mt-2 text-gray-700">
                            <li class="flex border-y py-2">
                                <span class="font-bold w-32">Teach By:</span>
                                <span class="text-gray-700">{courseDetails?.teacher.name}</span>
                            </li>
                            <li class="flex border-b py-2">
                                <span class="font-bold w-32">Phone:</span>
                                <span class="text-gray-700">{courseDetails?.teacher.phone}</span>
                            </li>
                            <li class="flex border-b py-2">
                                <span class="font-bold w-32">Joined At:</span>
                                <span class="text-gray-700">{courseDetails?.createdAt}</span>
                            </li>

                        </ul>
                    </div>

                </div>

                <div>
                    <div className="border border-1 border-orange-500 text-gray-800 w-full  mt-10 grid  grid-cols-2   rounded-md">
                        <div className="text-center p-4 hover:bg-orange-500 hover:text-white cursor-pointer">Enrolled Students</div>
                        <div className="text-center p-4 hover:bg-orange-500 hover:text-white cursor-pointer">Applied Students</div>
                    </div>


                    <div className="mt-8">
                        <div className="grid grid-cols-4 gap-2">
                            {courseDetails?.enrolledStudents.length === 0 ? (
                                <div>No classes are there</div>
                            ) : (
                                courseDetails?.enrolledStudents.map((student) => (
                                    <div key={student._id} className="border border-1 p-4">
                                        <p>Name: <span>{student.name}</span></p>
                                        <p>Phone: <span>{student.phone}</span></p>
                                    </div>
                                ))
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </>
    )
}

export default Eachcourse