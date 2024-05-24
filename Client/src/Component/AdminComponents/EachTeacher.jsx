
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

const EachTeacher = () => {

    const navigate = useNavigate();
    const [teacherDetails, setTeacherDetails] = useState(null);
    const [classIds, setClassIds] = useState([]);
    const [classesData, setClassesData] = useState([])
    const [loading, setLoading] = useState(true);
    const [selectedClassId, setSelectedClassId] = useState("");


    const { id } = useParams();
    // console.log(id);


    const token = localStorage.getItem("token");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // No token found, redirect to login page
            navigate("/login");
        }

        const fetchTeacherDetails = async () => {
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
                    `http://localhost:7000/api/admin-confi/all-teachers/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.status == 200) {
                    const oneteacher = response.data;
                    // console.log(oneteacher);
                    const allclassIds = response.data.myClasses

                    // console.log(classIds);

                    setTeacherDetails(response.data);
                    setClassIds(allclassIds);

                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchTeacherDetails();
    }, []);


    //   teacher courses 
    useEffect(() => {

        const fetchAllTeachersCourses = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    // No token found, redirect to login page
                    navigate("/login");
                    return;
                }

                const classesData = [];
                for (const classId of classIds) {
                    const classResponse = await axios.get(`http://localhost:7000/api/admin-confi/all-classes/${classId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (classResponse.status === 200) {
                        // console.log("classdata", classResponse.data);
                        classesData.push(classResponse.data);
                    }
                }
                setClassesData(classesData);

            } catch (error) {

                console.error("Error fetching teachers' classes:", error);
            }
            finally {
                setLoading(false);
            }

        };

        fetchAllTeachersCourses();
    }, [teacherDetails])

    const handleViewClass = (classId) => {
        setSelectedClassId(classId);
        navigate(`/admin-dashboard/${id}/${classId}`);
    };


    
    return (
        <>
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
                </div>
            )}

            <div class="w-full h-40">
                <img src="https://t4.ftcdn.net/jpg/03/16/92/61/360_F_316926143_cVdnI6bJPbhlo1yZVTJk0R0sjBx4vVnO.jpg" class="w-full h-full rounded-tl-lg rounded-tr-lg" />
            </div>
            <div class="flex flex-col items-center -mt-20">
                <img src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=" class="w-40 border-4 border-white rounded-full" />
                <div class="flex items-center space-x-2 mt-2">
                    <p class="text-2xl">{teacherDetails?.name}</p>
                    <span class="bg-blue-500 rounded-full p-1" title="Verified">
                        <svg xmlns="http://www.w3.org/2000/svg" class="text-gray-100 h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </span>
                </div>
                <p class="text-gray-700">Phone: {teacherDetails?.phone}</p>

            </div>
            {/* <div class="flex-1 flex flex-col items-center lg:items-end justify-end px-8 mt-2">
                <div class="flex items-center space-x-4 mt-2">
                    <button class="flex items-center bg-blue-600 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded text-sm space-x-2 transition duration-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                        </svg>
                        <span>Connect</span>
                    </button>
                    <button class="flex items-center bg-blue-600 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded text-sm space-x-2 transition duration-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Message</span>
                    </button>
                </div>
            </div> */}


            <div class="my-4 flex flex-col 2xl:flex-row space-y-4 2xl:space-y-0 2xl:space-x-4">
                <div class="w-full flex flex-col 2xl:w-1/3">
                    <div class="flex-1 bg-white rounded-lg shadow-xl p-8">
                        <h4 class="text-xl text-gray-900 font-bold">Personal Info</h4>
                        <ul class="mt-2 text-gray-700">
                            <li class="flex border-y py-2">
                                <span class="font-bold w-24">Full name:</span>
                                <span class="text-gray-700">{teacherDetails?.name}</span>
                            </li>



                            <li class="flex border-b py-2">
                                <span class="font-bold w-24">Mobile:</span>
                                <span class="text-gray-700">{teacherDetails?.phone}</span>
                            </li>



                        </ul>
                    </div>
                    <div className="py-4">
                        <h1 className="text-3xl text-gray-700 font-bold ">All Courses </h1>
                        <div className="bg-orange-500 w-20 h-1"></div>
                    </div>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 ">
                        {

                            classesData.map((course) => (
                                <div className=' border  rounded-md border-0 shadow-xl hover:shadow-none cursor-pointer' key={course._id}>
                                    <div className='px-2 py-3 col-span-1 bg-orange-500 rounded-md'>
                                        <span className='text-sm text-white'>Course</span>
                                        <p className='text-xl font-bold text-white'>{course.classTitle}</p>
                                        <div className='w-20 h-0.5 bg-orange-100 mb-2'></div>
                                        {/* <p className='text-sm text-gray-100'>{course.classSchedule}</p> */}


                                        <span className='text-sm text-gray-50  -mt-3' >
                                            Total hours <span className='bg-gray-50 text-bold text-black px-1 rounded-full'>{course.totalHours}</span>
                                        </span>



                                        <a className='text-gray-100 flex items-center text-sm mt-1 justify-end' onClick={() => handleViewClass(course._id)}>
                                             View
                                           
                                            <svg className="h-4 w-4 text-gray-100" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" />
                                                <polyline points="9 6 15 12 9 18" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            ))

                        }

                    </div>
                </div>

            </div>
        </>
    )
}

export default EachTeacher