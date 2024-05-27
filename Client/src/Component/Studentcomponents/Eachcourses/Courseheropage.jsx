import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const Courseheropage = () => {
    const { id } = useParams();
    const [studentData, setStudentData] = useState(null);
    const [classData, setClassData] = useState(null);


    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };


    useEffect(() => {

        const fetchStudentData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    // Token not found in local storage, handle the error or redirect to the login page
                    console.error("No token found");
                    navigate("/student-login");
                    return;
                }

                // Fetch associates data from the backend
                const response = await axios.get(
                    "https://mentor-language-institute-backend.onrender.com/api/students/my-profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.status == 200) {
                    // console.log("studetails", response.data);
                    const studentdetails = response.data;
                    setStudentData(studentdetails);

                    const classes = response.data.classes;
                    // console.log("classes", classes)



                    const classResponse = await axios.get(
                        `https://mentor-language-institute-backend.onrender.com/api/students/all-courses/${id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (classResponse.status === 200) {
                        const classData = classResponse.data;
                        // console.log("Enrolled class details:", classData);
                        setClassData(classData);

                    }


                } else {
                    // console.log(response.data);

                }
            } catch (error) {
                console.error("Error fetching student data:", error);

            }
        };

        fetchStudentData();
    }, [id])

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/student-login";
        // console.log("Logging out");
    };


    return (
        <>
            <div class="relative bg-gradient-to-r from-purple-600 to-blue-600 h-lg text-white overflow-hidden">
                <div class="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1522252234503-e356532cafd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw2fHxjb2RlfGVufDB8MHx8fDE2OTQwOTg0MTZ8MA&ixlib=rb-4.0.3&q=80&w=1080" alt="Background Image" class="object-cover object-center w-full h-full" />
                    <div class="absolute inset-0 bg-black opacity-50">
                    </div>

                </div>

                <div className='flex justify-end items-center'>
                    <li className='relative group z-50 flex items-center float-right mr-1 p-4 cursor-pointer'>
                        <Link to={'/student/chat'} className="block py-2 px-3 text-gray-200  rounded md:px-2 md:py-1 rounded-full bg-orange-400 " aria-current="page" >Chat Now</Link>
                    </li>
                    <ul className='relative'>
                        <li>
                            <button
                                id="dropdownNavbarLink"
                                onClick={toggleDropdown}
                                className="text-gray-100  border-b border-gray-100 md:hover:bg-transparent md:border-0 pl-3 pr-4 py-2 md:hover:text-orange-400 md:p-0 font-medium flex items-center justify-between w-full md:w-auto"
                            >
                                Help ?
                                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <div
                                    id="dropdownNavbar"
                                    className="absolute right-0 mt-2 bg-white text-base z-10 list-none divide-y divide-gray-100 rounded shadow w-54"
                                >
                                    <ul className="py-1" aria-labelledby="dropdownLargeButton">
                                        <li>
                                            <a href="#" className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">+91-9999466159</a>
                                        </li>

                                    </ul>
                                    <div className="py-1">
                                        <a href="#" className="text-sm hover:bg-gray-100 text-gray-700 text-wrap block px-4 py-2">mentor.languageclasses@gmail.com</a>
                                    </div>
                                </div>
                            )}
                        </li>
                    </ul>
                    <li className='relative group z-50 flex items-center float-right mr-1 p-4 cursor-pointer'>
                        <Link className="block py-2 px-3 text-gray-200  rounded md:p-0" aria-current="page" onClick={handleLogout}>Logout</Link>
                        <svg class="h-6 w-6 text-gray-200 mx-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />  <polyline points="16 17 21 12 16 7" />  <line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </li>
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
                        <Link to={'/main-dashboard'} class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-500  ">
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
                            <a href="#" class="ms-1 text-sm font-medium text-gray-700 hover:text-orange-500 md:ms-2  ">Course</a>
                        </div>
                    </li>
                    <li aria-current="page">
                        <div class="flex items-center">
                            <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                            </svg>
                            <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 "></span>
                        </div>
                    </li>
                </ol>
            </nav>

        </>

    )
}

export default Courseheropage