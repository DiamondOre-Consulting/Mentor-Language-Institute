import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Courseheropage = () => {
    const [studentData, setStudentData] = useState(null);
    const [classData, setClassData] = useState(null)

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
                    console.log("studetails",response.data);
                    const studentdetails= response.data;
                    setStudentData(studentdetails);

                    const classes = response.data.classes;
                   console.log("classes",classes)

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
                            setClassData(classData);
                           
                        }
                    }
                
                    

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
            <div class="relative bg-gradient-to-r from-purple-600 to-blue-600 h-lg text-white overflow-hidden">
                <div class="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1522252234503-e356532cafd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw2fHxjb2RlfGVufDB8MHx8fDE2OTQwOTg0MTZ8MA&ixlib=rb-4.0.3&q=80&w=1080" alt="Background Image" class="object-cover object-center w-full h-full" />
                    <div class="absolute inset-0 bg-black opacity-50"></div>
                </div>

                <div class="relative z-10 flex flex-col justify-start py-10 px-10 h-full text-center">
                    <div className='flex items-center'>
                        <div className='bg-orange-500 h-20 w-1'></div>
                        <div className='flex flex-col mx-2'>
                            <h1 className="text-4xl font-bold">{classData?.classTitle}</h1>
                        </div>
                    </div>
                </div>
            </div>



            <nav class="flex px-10 py-2" aria-label="Breadcrumb">
                <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li class="inline-flex items-center">
                        <Link to={'/main-dashboard'} class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                            <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                            </svg>
                            Home
                        </Link>
                    </li>
                    <li>
                        <div class="flex items-center">
                            <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                            </svg>
                            <a href="#" class="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">Course</a>
                        </div>
                    </li>
                    <li aria-current="page">
                        <div class="flex items-center">
                            <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                            </svg>
                            <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400"></span>
                        </div>
                    </li>
                </ol>
            </nav>

        </>

    )
}

export default Courseheropage