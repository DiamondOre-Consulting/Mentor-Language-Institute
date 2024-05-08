import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Allstudents from './Allstudents';
import AllTeachers from './AllTeachers';
import axios from "axios";

const Home = () => {

    const [allStudents, setAllStudents] = useState([]);
    const [allTeachers , setAllTeachers] = useState([]);
    const [allCourses, setAllCourses] = useState([]);

    // allstudents
    useEffect(() => {
        const fetchAllStudents = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.error("No token found");
                    navigate("/admin-login");
                    return;
                }


                const response = await axios.get(
                    "http://192.168.29.235:7000/api/admin-confi/all-students",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (response.status == 200) {
                    console.log(response.data);
                    const allstudents = response.data;
                    console.log(allstudents);
                    setAllStudents(allstudents);
                }
            } catch (error) {
                console.error("Error fetching associates:", error);

            }
        };

        fetchAllStudents();
    }, []);

    // allcourses
  useEffect(() => {
    const fetchAllcourses = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }


        const response = await axios.get(
          "http://192.168.29.235:7000/api/admin-confi/all-classes",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (response.status == 200) {
          console.log(response.data);
          const allcourses = response.data;
          console.log(allcourses);
          setAllCourses(allcourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);

      }
    };

    fetchAllcourses();
  }, []);

//   allteachers

useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/admin-login");
          return;
        }

       
        const response = await axios.get(
          "http://192.168.29.235:7000/api/admin-confi/all-teachers",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (response.status == 200) {
          console.log(response.data);
          const allteachers = response.data;
          console.log(allteachers);
          setAllTeachers(allteachers);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        
      }
    };

    fetchAllTeachers();
  }, []);


  


    return (
        <>

            <div>
                <h1 className='text-3xl font-semibold mb-10 text-gray-600'><span className='text-4xl'>Welcome !! </span><br></br><span className='text-orange-500 font-bold'>Admin</span></h1>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                            <a href="#">
                                <img class="rounded-t-lg" src="https://t3.ftcdn.net/jpg/03/88/97/92/360_F_388979227_lKgqMJPO5ExItAuN4tuwyPeiknwrR7t2.jpg" alt="" />
                            </a>
                            <div class="p-5">
                                <a href="#">
                                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">All Students</h5>
                                </a>
                                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Total students : {allStudents.length}</p>
                                <Link to='/admin-dashboard/allstudents' onClick={() => handleSectionClick('students')} class="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-orange-500  rounded-lg hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Explore More
                                    <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                    </div>
                    <div>
                        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                            <a href="#">
                                <img class="rounded-t-lg" src="https://www.teacheracademy.eu/wp-content/uploads/2021/10/successful-teacher-1-608x405.jpg" alt="" />
                            </a>
                            <div class="p-5">
                                <a href="#">
                                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">All Teachers</h5>
                                </a>
                                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Total Teachers : {allTeachers.length}</p>
                                <Link to='/admin-dashboard/allteachers' onClick={() => handleSectionClick('teachers')} class=" cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-orange-500  rounded-lg hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Explore More
                                    <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                            <a href="#">
                                <img class="rounded-t-lg" src="https://www.investopedia.com/thmb/N-OFg2MCyywPGORRfb3LNAnspHM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/OnlineCourses_Jacek-Kita-e2c9d834d3524d76ac28da76aec203ca.jpg" alt="" />
                            </a>
                            <div class="p-5">
                                <a href="#">
                                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">All Courses</h5>
                                </a>
                                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Total Courses : {allCourses.length}</p>
                                <Link to='/admin-dashboard/allcourses' onClick={() => handleSectionClick('courses')} class=" cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-orange-500  rounded-lg hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Explore More
                                    <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </>
    )
}

export default Home