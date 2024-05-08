
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



const Eachcourse = () => {

    const navigate = useNavigate();
    const [courseDetails, setCourseDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('enrolled');
    const [loading, setLoading] = useState(false);

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    const { id } = useParams();
    console.log(id);
    
    const token = localStorage.getItem("token");
  

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // No token found, redirect to login page
            navigate("/login");
        } 
        

        const fetchCourseDetails = async () => {
            try {
                setLoading(true)
                
                const token = localStorage.getItem("token");

                if (!token) {
                    // Token not found in local storage, handle the error or redirect to the login page
                    console.error("No token found");
                    navigate("/login");
                    return;
                }

                // Fetch course details
                const response = await axios.get(
                    `http://192.168.29.235:7000/api/admin-confi/all-classes/${id}`,
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
                        `http://192.168.29.235:7000/api/admin-confi/all-teachers/${teacherId}`,
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
                            `http://192.168.29.235:7000/api/admin-confi/all-students/${studentId}`,
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

                    // Fetch details of applied students
                    const applyStudents = courseData.appliedStudents;
                    const appliedStudentsDetails = [];

                    for (const studentId of applyStudents) {
                        const studentResponse = await axios.get(
                            `http://192.168.29.235:7000/api/admin-confi/all-students/${studentId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (studentResponse.status === 200) {
                            const studentData = studentResponse.data;
                            console.log("Applied student details:", studentData);
                            appliedStudentsDetails.push(studentData);
                        }
                    }

                    // Set course details including teacher, enrolled students, and applied students
                    setCourseDetails({
                        ...courseData,
                        enrolledStudents: enrolledStudentsDetails,
                        appliedStudents: appliedStudentsDetails
                    });
                }
            } catch (error) {
                console.log(error);
            }
            finally {
                setLoading(false);
              }
        };


        fetchCourseDetails();
    }, []);

    console.log("coursedetails", courseDetails)
    return (
        <>
            <div>
            {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
        </div>
      )}
                <h1 className='text-2xl md:px-0 px-4 font-bold md:mb-1 mb-4'>{courseDetails?.classTitle}</h1>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:w-1/3">
                    <div class="flex-1  bg-white rounded-lg shadow-xl p-8">
                        <h4 class="text-xl text-gray-900 font-bold">Course Details</h4>
                        <ul class="mt-2 text-gray-700">
                            <li class="flex border-y py-2">
                                <span class="font-bold w-32">Title:</span>
                                <span class="text-gray-700">{courseDetails?.classTitle}</span>
                            </li>
                            <li class="flex border-b py-2">
                                <span class="font-bold w-32">Total Hours:</span>
                                <span class="text-gray-700">{courseDetails?.totalHours}</span>
                            </li>
                            <li class="flex border-b py-2">
                                <span class="font-bold w-32">Created At:</span>
                                <span class="text-gray-700">{new Date(courseDetails?.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
                                <span class="text-gray-700">{new Date(courseDetails?.teacher.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </li>

                        </ul>
                    </div>

                </div>

                <div>
                    <div className="border border-1 border-orange-500 text-gray-800 w-full mt-10 grid grid-cols-2 rounded-md">
                        <div className={`text-center p-4 hover:bg-orange-500 hover:text-white cursor-pointer ${activeTab === 'enrolled' ? 'bg-orange-500 text-white' : ''}`} onClick={() => handleTabSwitch('enrolled')}>
                            Enrolled Students
                        </div>
                        <div className={`text-center p-4 hover:bg-orange-500 hover:text-white cursor-pointer ${activeTab === 'applied' ? 'bg-orange-500 text-white' : ''}`} onClick={() => handleTabSwitch('applied')}>
                            Applied Students
                        </div>
                    </div>


                    <div className="mt-8">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {activeTab === 'enrolled' && courseDetails?.enrolledStudents && courseDetails.enrolledStudents.map((student) => (
                                <div key={student._id} className="border border-1 p-4 shadow-xl bg-orange-500 text-gray-100 rounded-md">
                                    <p>Name: <span>{student.name}</span></p>
                                    <p>Phone: <span>{student.phone}</span></p>
                                </div>
                            ))}
                            {activeTab === 'applied' && courseDetails?.appliedStudents
                                && courseDetails.appliedStudents
                                    .map((student) => (
                                        <div key={student._id} className="border border-1 p-4 shadow-xl bg-orange-500 text-gray-100 rounded-md">
                                            <p>Name: <span>{student.name}</span></p>
                                            <p>Phone: <span>{student.phone}</span></p>
                                        </div>
                                    ))}

                        </div>

                    </div>

                </div>

            </div>

        </>
    )
}

export default Eachcourse