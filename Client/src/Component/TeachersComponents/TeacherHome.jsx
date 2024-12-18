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
    const [numberOfClasses, setNumberOfClasses] = useState(0);
    const [oneClassDetails, setOneClassDetails] = useState("");
    const [alldetails, setAllDetails] = useState();
    const [bottompopup, setBottomPopUp] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updateHoursInput, setUpdateHoursInput] = useState(0);
    const [selectedClassIdToUpdate, setSelectedClassIdToUpdate] = useState("");
    const [showUpdateHoursPopup, setShowUpdateHoursPopup] = useState(false);
    const [showLoader, setShowLoader] = useState(false);


    const handleDateChange = (event) => {
        const selectedDate = new Date(event.target.value);
        const day = selectedDate.getDate().toString().padStart(2, '0');
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        setDate(formattedDate);
        // console.log(date)
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

           
            // console.log("classId",classIds)
            const classesData = [];
            for (const classId of classIds) {
                const classResponse = await axios.get(`https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/my-classes/${classId}`, {
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
            setShowLoader(true);
            const token = localStorage.getItem("token");
            if (!token) {

                navigate("/login");
                return;
            }
            // console.log("selected schedule", selectedClassId)
            const response = await axios.post(
                `https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/schedule-class/${selectedClassId}`,
                { date, numberOfClasses },
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
                setShowLoader(false);

            }
        } catch (error) {
            // console.log('Failed to schedule the class. Please try again later.', error);
            setShowLoader(false);
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

                const classresponse = await axios.get(`https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/my-classes/${selectedClassId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (classresponse.status === 200) {
                    const oneclass = classresponse.data;
                    setOneClassDetails(oneclass)
                    // console.log("selected class details", oneClassDetails)


                }

                // const allsturesponse = await axios.get(`https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/class/all-students/${selectedClassId}`, {
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });


                // if (allsturesponse.status === 200) {
                //     // console.log("allsturesponsedata", allsturesponse.data)
                //     setAllDetails(allsturesponse.data);
                //     // console.log(alldetails)
                // }


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
                    "https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/my-classes",
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
                        // console.log("no class has been assigned to you");
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
                `https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/update-class-hours/${selectedClassId}`,
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

            <div className='md:mt-0 p-6'>
                <div className='mt-10 md:mt:0'>
                        <div>
                            <h1 className='text-3xl font-semibold mb-10 text-gray-600'><span className='text-5xl'>Welcome !! </span><br></br><span className='text-orange-500 text-5xl font-bold'>{teacherData?.name}</span></h1>
                            <h1 className='text-2xl font-bold'>My Courses</h1>
                            <div className='w-24 h-1 border-rounded bg-orange-500 mb-4'></div>

                            <div className='grid grid-cols--1 md:grid-cols-3 gap-4 '>
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
                                type="number"
                                value={numberOfClasses}
                                onChange={(e) => setNumberOfClasses(e.target.value)}
                                className="w-full mb-4"
                                placeholder="Enter Number of Classes"
                            />

                            <a onClick={handleScheduleClass}
                                className="block w-full px-4 py-2 bg-orange-400 text-center hover:bg-orange-500 text-sm font-semibold text-white rounded-lg shadow-md  focus:outline-none cursor-pointer"

                            >    {showLoader ? (
                                <svg aria-hidden="true" class="inline w-4 h-4 text-gray-200 animate-spin  fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                            ) : (
                                <span class="relative z-10"> Schedule Class</span>)}
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