import React, { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import { useJwt } from 'react-jwt'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'

const StudentChat = () => {

    const navigate = useNavigate();
    const { decodedToken } = useJwt(localStorage.getItem("token"));
    const userName = decodedToken ? decodedToken.name : "No Name Found";
    const [classData, setClassData] = useState([]);
    const [teacherData, setTeacherData] = useState([]);


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
                    console.log("studetails", response.data);
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
                            const classData = classResponse.data.teachBy;
                            console.log("All Teacher By Id :", classData);
                            allClassData.push(classData);
                        }
                    }
                    setClassData(allClassData);
                    console.log("Teachers Ids", allClassData)


                } else {
                    console.log(response.data);

                }
            } catch (error) {
                console.error("Error fetching student data:", error);

            }
        };

        fetchStudentData();
    }, [])


    // get teachers name by id 
    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.error("No token found");
                    navigate("/login");
                    return;
                }

                const uniqueTeacherIds = new Set(classData);

                const teacherPromises = Array.from(uniqueTeacherIds).map(async (teacherId) => {
                    const teacherResponse = await axios.get(
                        `http://localhost:7000/api/students/teacher/${teacherId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    return teacherResponse.data;
                });

                const teachers = await Promise.all(teacherPromises);
                setTeacherData(teachers);
            } catch (error) {
                console.error("Error fetching teacher data:", error);
            }
        };

        if (classData.length > 0) {
            fetchTeacherData();
        }
    }, [classData]);





    return (
        <>

            <div className="flex h-screen antialiased text-gray-800">
                <div className="flex flex-row h-full w-full overflow-x-hidden">
                    <div className="flex flex-col py-8 pl-6 pr-2 w-full sm:w-64 bg-white flex-shrink-0">
                        <div className="flex flex-row items-center justify-start h-12 w-full">
                            <Link to="/main-dashboard">
                                <svg className="h-8 w-8 text-gray-800 cursor-pointer" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <line x1="5" y1="12" x2="9" y2="16" />
                                    <line x1="5" y1="12" x2="9" y2="8" />
                                </svg>
                            </Link>
                            <img src={logo} className="h-12 md:h-16 ml-10" alt="logo" />
                        </div>
                        <div className="flex flex-col items-center bg-gray-50 mt-4 w-full py-6 px-4 rounded-lg">
                            <div className="h-20 w-20 rounded-full border overflow-hidden">
                                <img src="https://static.thenounproject.com/png/363640-200.png" alt="Avatar" className="h-full w-full" />
                            </div>
                            <div className="text-sm font-semibold mt-2">{userName}</div>
                        </div>
                        <div className="flex flex-col mt-8">
                            <div className="flex flex-row items-center justify-between text-xs">
                                <span className="font-bold">Associated Teachers</span>
                                <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">4</span>
                            </div>
                            <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
                                {teacherData.map((teacher, index) => (
                                    <button key={index} className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                                        <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">{teacher.name.charAt(0)}</div>
                                        <div className="ml-2 text-sm font-semibold">{teacher.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col flex-auto h-full p-6">
                        <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-50 h-full p-4">
                            <div className="flex flex-col h-full overflow-x-auto mb-4">
                                <div className="grid grid-cols-12 gap-y-2">
                                    <div class="col-start-1 col-end-8 p-3 rounded-lg">
                                        <div class="flex flex-row items-center">
                                            <div
                                                class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                            >
                                                A
                                            </div>
                                            <div
                                                class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                                            >
                                                <div>Hey How are you today?</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-start-1 col-end-8 p-3 rounded-lg">
                                        <div class="flex flex-row items-center">
                                            <div
                                                class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                            >
                                                A
                                            </div>
                                            <div
                                                class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                                            >
                                                <div>
                                                    Lorem ipsum dolor sit amet, consectetur adipisicing
                                                    elit. Vel ipsa commodi illum saepe numquam maxime
                                                    asperiores voluptate sit, minima perspiciatis.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-start-6 col-end-13 p-3 rounded-lg">
                                        <div class="flex items-center justify-start flex-row-reverse">
                                            <div
                                                class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                            >
                                                A
                                            </div>
                                            <div
                                                class="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl"
                                            >
                                                <div>I'm ok what about you?</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-start-6 col-end-13 p-3 rounded-lg">
                                        <div class="flex items-center justify-start flex-row-reverse">
                                            <div
                                                class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                            >
                                                A
                                            </div>
                                            <div
                                                class="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl"
                                            >
                                                <div>
                                                    Lorem ipsum dolor sit, amet consectetur adipisicing. ?
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-start-1 col-end-8 p-3 rounded-lg">
                                        <div class="flex flex-row items-center">
                                            <div
                                                class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                            >
                                                A
                                            </div>
                                            <div
                                                class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                                            >
                                                <div>Lorem ipsum dolor sit amet !</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-start-6 col-end-13 p-3 rounded-lg">
                                        <div class="flex items-center justify-start flex-row-reverse">
                                            <div
                                                class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                            >
                                                A
                                            </div>
                                            <div
                                                class="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl"
                                            >
                                                <div>
                                                    Lorem ipsum dolor sit, amet consectetur adipisicing. ?
                                                </div>
                                                <div
                                                    class="absolute text-xs bottom-0 right-0 -mb-5 mr-2 text-gray-500"
                                                >
                                                    Seen
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-start-1 col-end-8 p-3 rounded-lg">
                                        <div class="flex flex-row items-center">
                                            <div
                                                class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                            >
                                                A
                                            </div>
                                            <div
                                                class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                                            >
                                                <div>
                                                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                                    Perspiciatis, in.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
                                <div className="flex-grow ml-4">
                                    <div className="relative w-full">
                                        <input type="text" className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10" />
                                        <button className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <button className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0">
                                        <span>Send</span>
                                        <span className="ml-2">
                                            <svg className="w-4 h-4 transform rotate-45 -mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StudentChat