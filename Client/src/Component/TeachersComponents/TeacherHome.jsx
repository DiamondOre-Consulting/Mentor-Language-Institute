import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { Button, Tooltip } from "flowbite-react";


const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;


const TeacherHome = ({ teacherData }) => {

    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupCourses, setShowPopupCourses] = useState(false);
    const [showScheduleClass, setShowScheduleClass] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [classesData, setClassesData] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [date, setDate] = useState(null);
    const [numberOfClasses, setNumberOfClasses] = useState("");
    const [oneClassDetails, setOneClassDetails] = useState("");
    const [alldetails, setAllDetails] = useState();
    const [bottompopup, setBottomPopUp] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updateHoursInput, setUpdateHoursInput] = useState(0);
    const [selectedClassIdToUpdate, setSelectedClassIdToUpdate] = useState("");
    const [showUpdateHoursPopup, setShowUpdateHoursPopup] = useState(false);


    const handleDateChange = (event) => {
        const selectedDate = new Date(event.target.value);
        const day = selectedDate.getDate().toString().padStart(2, '0');
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        setDate(formattedDate);
        console.log(date)
    };


    const handleClose = () => {
        setShowPopup(false);
    };

    const handleCloseScheduleClass = () => {
        setShowScheduleClass(false)
    }

    const handleCloseCourses = () => {
        setShowPopupCourses(false);
        setShowScheduleClass(false)
    };
    const handleViewClass = (classId) => {
        setSelectedClassId(classId); // Set the selected class ID
        // console.log("selected class id", selectedClassId)
        setShowPopupCourses(true);

    };

    const handleveiw = (classId) => {
        setSelectedClassId(classId);
        setShowUpdateHoursPopup(true);

    }


    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };





    const fetchAllTeachersCourses = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                // No token found, redirect to login page
                navigate("/login");
                return;
            }

            const classIds = teacherData.myClasses;
            const classesData = [];
            for (const classId of classIds) {
                const classResponse = await axios.get(`http://localhost:7000/api/teachers/my-classes/${classId}`, {
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
            // console.log("class data of teacher", classesData)
        } catch (error) {

            console.error("Error fetching teachers' classes:", error);
        }

    };

    if (teacherData && teacherData.myClasses) {
        fetchAllTeachersCourses();
    }


    useEffect(() => {
        fetchAllTeachersCourses();


    }, [teacherData])



    const handleScheduleClass = async () => {
        try {

            const token = localStorage.getItem("token");
            if (!token) {

                navigate("/login");
                return;
            }
            // console.log("selected schedule", selectedClassId)
            const response = await axios.post(
                `http://localhost:7000/api/teachers/schedule-class/${selectedClassId}`,
                { date ,numberOfClasses },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log("done");
                // console.log(response.data)
                // console.log(date)
                setShowScheduleClass(false);
                setShowPopup(true)
                setTimeout(() => {
                    setShowPopup(false);
                }, 2000);


            }
        } catch (error) {
            console.log('Failed to schedule the class. Please try again later.', error);
        }
    };

    // console.log(date)
    useEffect(() => {

        const allDetails = async () => {

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    // No token found, redirect to login page
                    navigate("/login");
                    return;
                }

                const classresponse = await axios.get(`http://localhost:7000/api/teachers/my-classes/${selectedClassId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (classresponse.status === 200) {
                    const oneclass = classresponse.data;
                    setOneClassDetails(oneclass)
                    console.log("selected class details", oneClassDetails)


                }

                const allsturesponse = await axios.get(`http://localhost:7000/api/teachers/class/all-students/${selectedClassId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });


                if (allsturesponse.status === 200) {
                    // console.log("allsturesponsedata", allsturesponse.data)
                    setAllDetails(allsturesponse.data);
                    // console.log(alldetails)
                }


            }
            catch (error) {
                // setError('all students');
            }


        }



        allDetails();


    }, [selectedClassId])




    const [allCourses, setAllCourses] = useState([]);

    useEffect(() => {
        const fetchAllcourses = async () => {
            // setLoading(true);
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.error("No token found");
                    navigate("/login");
                    return;
                }


                const response = await axios.get(
                    "http://localhost:7000/api/teachers/my-classes",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (response.status == 200) {
                    // console.log(response.data);
                    const allcourses = response.data;
                    // console.log(allcourses);
                    setAllCourses(allcourses);
                }
            } catch (error) {
                if (error.response) {
                    const status = error.response.status;
                    if (status === 405) {
                        console.log("no class has been assigned to you");
                        alert("no class has been assigned to you")

                    } else {
                        console.error("no class has been assigned you", status);

                    }
                }
            }
            finally {
                setLoading(false);
            }
        };
        fetchAllcourses();

    }, []);



    // update hours 
    const handleUpdateHours = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.put(
                `http://localhost:7000/api/teachers/update-class-hours/${selectedClassId}`,
                { updatedHours: updateHoursInput },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                fetchAllTeachersCourses();
                console.log("Hours updated successfully");
                setShowUpdateHoursPopup(false);
                setShowPopupCourses(false);

            }
        } catch (error) {
            console.error("Failed to update hours:", error);
            // Handle error
        }
    };



    return (
        <>

            <div>
                <div className='grid md:grid-cols-10 gap-8'>
                    <div className='col-span-7'>
                        <div>
                            <h1 className='text-3xl font-semibold mb-10 text-gray-600'><span className='text-4xl'>Welcome !! </span><br></br><span className='text-orange-500 font-bold'>{teacherData?.name}</span></h1>
                            <h1 className='text-2xl font-bold'>My Courses</h1>
                            <div className='w-24 h-1 border-rounded bg-orange-500 mb-4'></div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 py-4'>
                                {loading ? (
                                    <div style={override}>
                                        <ClipLoader color={"#FFA500"} loading={loading} size={30} />
                                    </div>
                                ) : (

                                    classesData.map((course) => (
                                        <div className=' border rounded-md border-0 shadow-xl hover:shadow-none cursor-pointer' key={course._id}>
                                            <div className='px-2 py-3 col-span-1 bg-orange-500 rounded-md'>
                                                <span className='text-sm text-white'>Course</span>
                                                <p className='text-xl font-bold text-white'>{course.classTitle}</p>
                                                <div className='w-20 h-0.5 bg-orange-100 mb-2'></div>
                                                {/* <p className='text-sm text-gray-100'>{course.classSchedule}</p> */}

                                                <Tooltip content="Click To Edit Hours">
                                                    <Button>
                                                        <span className='text-sm text-gray-50 -ml-5 -mt-3' onClick={() => handleveiw(course._id)}>
                                                            Total hours <span className='bg-gray-50 text-bold text-black px-1 rounded-full'>{course.totalHours}</span>
                                                        </span>
                                                    </Button>
                                                </Tooltip>

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

                                )}
                            </div>

                        </div>


                    </div>

                    <div className='col-span-3 '>

                        <div className='grid grid-rows-8 grid-flow-col gap-4 '>
                            <div className='row-span-5 hidden md:block '>
                                <h1 className='font-bold text-lg'>Recent Messages</h1>
                                <div className='w-16 h-0.5 bg-orange-500 mb-6'></div>
                                <div class="flex items-start gap-2.5">
                                    <img class="w-8 h-8 rounded-full" src="https://static.vecteezy.com/system/resources/thumbnails/001/993/889/small/beautiful-latin-woman-avatar-character-icon-free-vector.jpg" alt="Jese image" />
                                    <div class="flex flex-col gap-1 w-full max-w-[320px]">
                                        <div class="flex flex-col leading-1.5 p-4 border-gray-200 bg-orange-500 shadow-md backdrop-filter backdrop-blur-md bg-opacity-20 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                                            <div class="flex items-center space-x-2 rtl:space-x-reverse">
                                                <span class="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
                                                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">11:46</span>
                                            </div>
                                        </div>

                                    </div>
                                    <button id="dropdownMenuIconButton" onClick={toggleDropdown} data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" class="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" type="button">
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                                            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                        </svg>
                                    </button>
                                    {isOpen && (
                                        <div className="z-10 absolute right-10 mt-16 bg-white divide-y divide-gray-100 rounded-lg shadow w-20 dark:bg-gray-700 dark:divide-gray-600">
                                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
                                                <li>
                                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Reply</a>
                                                </li>


                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div class="flex items-start mt-4 gap-2.5">
                                    <img class="w-8 h-8 rounded-full" src="https://static.vecteezy.com/system/resources/thumbnails/001/993/889/small/beautiful-latin-woman-avatar-character-icon-free-vector.jpg" alt="Jese image" />
                                    <div class="flex flex-col gap-1 w-full max-w-[320px]">
                                        <div class="flex flex-col leading-1.5 p-4 border-gray-200 bg-orange-500 shadow-md backdrop-filter backdrop-blur-md bg-opacity-20 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                                            <div class="flex items-center space-x-2 rtl:space-x-reverse">
                                                <span class="text-sm font-semibold text-gray-900 dark:text-white">jennie</span>
                                                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">11:46</span>
                                            </div>
                                        </div>

                                    </div>
                                    <button id="dropdownMenuIconButton" onClick={toggleDropdown} data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" class="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" type="button">
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                                            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                        </svg>
                                    </button>
                                    {isOpen && (
                                        <div className="z-10 absolute right-10 mt-16 bg-white divide-y divide-gray-100 rounded-lg shadow w-20 dark:bg-gray-700 dark:divide-gray-600">
                                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
                                                <li>
                                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Reply</a>
                                                </li>


                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>



                            <div className='hidden md:block row-span-2'>
                                <h1 className='font-bold text-lg'>Today's Classes (Optional)</h1>
                                <div className='w-16 h-0.5 bg-orange-500 mb-6'></div>
                                <div className='border border-1 border-orange-500 flex p-2 justify-between rounded-md items-center'>
                                    <div className='text-sm'>
                                        <p className='font-bold'>Monday / <span className='text-sm text-gray-600 '>12/03/2004 </span></p>
                                        <p>12:30pm</p>
                                    </div>

                                    <div>
                                        <svg class="h-8 w-8 text-green-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="12" cy="12" r="9" />  <path d="M9 12l2 2l4 -4" /></svg>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center">
                    {/* <div className="fixed inset-0 bg-black bg-opacity-50"></div> */}
                    <section className="absolute bg-black top-10 right-10 rounded-lg shadow-xl w-64 p-2 text-center">
                        <h2 className="text-md font-semibold opacity-100 text-gray-100">Your class has been scheduled</h2>
                    </section>
                </div>
            )}

            {showPopupCourses && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/4 relative">
                        <svg className="h-5 w-5 bg-red-600 cursor-pointer p-1 text-2xl rounded-full text-gray-50 absolute top-0 right-0 m-2" onClick={handleCloseCourses} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                        <div className="p-6 text-left ">
                            <div className='flex  items-center justify-between mt-2'>
                                <div>
                                    <Link
                                        to={`/teacher-dashboard/allstudents/${selectedClassId}`}
                                        className='p-2 bg-orange-500 rounded-md text-gray-100 cursor-pointer'>My Students</Link>
                                </div>
                                <div>
                                    <p className='p-2 bg-orange-500 rounded-md text-gray-100 cursor-pointer' onClick={() => setShowScheduleClass(true)}>Schedule Class</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}


            {showScheduleClass && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">

                    <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/3">
                        <svg class="h-5 w-5 bg-red-600 cursor-pointer p-1 rounded-full text-gray-100 float-right mr-1 mt-1 " onClick={handleCloseCourses} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>

                        <div className="p-6 text-left">
                            <p className='font-bold text-xl md:text-3xl text-black'>{oneClassDetails.classTitle}</p>
                            <h2 className="text-normal font-bold text-teal-green-900 mb-1"> Select Date</h2>
                            <input type='date' className='w-full mb-4' value={date ? date.split('-').reverse().join('-') : ''}  // Bind the value to the date state variable
                                onChange={handleDateChange} />

                            <input
                                type="text"
                                value={numberOfClasses}
                                onChange={(e) => setNumberOfClasses(e.target.value)}
                                className="w-full mb-4"
                                placeholder="Enter Number of Classes"
                            />

                            <a onClick={handleScheduleClass}
                                className="block w-full px-4 py-2 bg-orange-400 text-center hover:bg-orange-500 text-sm font-semibold text-white rounded-lg shadow-md  focus:outline-none cursor-pointer"

                            >
                                Schedule Class
                            </a>
                        </div>
                    </section>
                </div>
            )}


            {showUpdateHoursPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/4 relative">
                        <svg className="h-5 w-5 bg-red-600 cursor-pointer p-1 text-2xl rounded-full text-gray-50 absolute top-0 right-0 m-2" onClick={() => setShowUpdateHoursPopup(false)} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                        <div className="p-6 text-left ">
                            {/* Add input field and update button */}
                            <div className="flex items-center mt-4">
                                <input type="number" value={updateHoursInput} onChange={(e) => setUpdateHoursInput(e.target.value)} className="w-20 px-2 py-1 border rounded-md mr-2" />
                                <button onClick={handleUpdateHours} className="bg-green-500 text-white px-4 py-1 rounded-md">Update Hours</button>
                            </div>
                        </div>
                    </section>
                </div>
            )}








        </>
    )
}

export default TeacherHome