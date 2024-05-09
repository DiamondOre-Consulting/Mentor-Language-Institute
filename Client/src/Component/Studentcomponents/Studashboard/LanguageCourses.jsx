import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from "axios";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const LanguageCourses = () => {

    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupEnroll, setShowPopupEnroll] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [popupMessage, setPopupMessage] = useState(null);

    const { id } = useParams();
    const handleClose = () => {
        setShowPopup(false);
        setShowPopupEnroll(true)
    };

    const handleEnrollClose = () => {

        setShowPopupEnroll(false)
    }


    const handleEnrollClick = (courseId) => {
        console.log("Clicked on Enroll Now for course ID:", courseId);
        setSelectedCourseId(courseId);
        setShowPopup(true);
        setPopupMessage(null);
    };

    const settings = {
        centerMode: true,
        centerPadding: '60px',
        slidesToShow: 5,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 4
                }
            },

            {
                breakpoint: 992,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 2
                }
            },

            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }
        ]
    };

    console.log("selected id ", selectedCourseId);

    // each course
    const [Eachcourse, setEachCourse] = useState(null);
    useEffect(() => {
        console.log("Selected Course ID:", selectedCourseId);
        const fetchEachCourse = async () => {
            try {
                // Check if selectedCourseId is not null
                if (selectedCourseId) {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        console.error("No token found");
                        navigate("/login");
                        return;
                    }
                    const response = await axios.get(
                        `http://localhost:7000/api/students/all-courses/${selectedCourseId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    if (response.status === 200) {
                        console.log(response.data);
                        const eachcourses = response.data;
                        console.log(eachcourses);
                        setEachCourse(eachcourses);
                    }
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchEachCourse();
    }, [selectedCourseId]);



    const [allCourses, setAllCourses] = useState([]);

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
                    "http://localhost:7000/api/students/all-courses",
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

    // apply course 
    console.log("courseid", selectedCourseId)

    const handleApplyCourse = async (selectedCourseId) => {

        try {
            setPopupMessage(null);
            setShowPopup(false);

            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            console.log("after try block applied course ", selectedCourseId)

            const response = await axios.post(
                `http://localhost:7000/api/students/apply-course/${selectedCourseId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                console.log('Successfully applied for course');
                setShowPopup(false);
                setShowPopupEnroll(true);
                setSelectedCourseId(null);

            }
            else {
                console.log("some errors occurred")
            }
        } catch (error) {
            console.error('Error applying in course:', error);
            if (error.response) {
                const status = error.response.status;
                if (status === 409) {
                    console.log("Student has already applied in this course!!!")
                    setPopupMessage("You Have Already Applied For This Course!!!")
                    setShowPopup(false)
                }
                else if (status === 408) {
                    console.log('Student is already enrolled in this course!!!');
                    setPopupMessage("You Are Already Enrolled In This Course!!!");
                    setShowPopup(false)

                }

            }
        }
    };


    return (
        <>
            <div className='px-10 ' id='courses'>
                <h1 className='text-3xl md:text-4xl font-bold mb-10 md:mb-24 text-gray-900'>Language Courses</h1>

                <div className='slider-container PY-10'>
                    {
                        <Slider {...settings} >
                            {allCourses.map((course) => (

                                <div key={course._id} className='relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md transform hover:scale-105 h-56  transition duration-'>
                                    {/* Notebook Lines */}
                                    {/* <div className='absolute inset-0 bg-gradient-to-b from-orange-200 to-gray-100 opacity-50'></div> */}

                                    {/* Content */}
                                    <div className="px-4 py-8 grid grid-cols-1 h-56 gap-4 content-between">
                                        <div>
                                            <h1 className="text-xl font-bold mb-2">{course.classTitle}</h1>
                                            <p className="text-gray-600  uppercase">Mentor Institute</p></div>


                                        <button className="block w-full px-4 py-2 cursor-pointer hover:bg-orange-500 bg-orange-400 text-sm font-semibold text-white rounded-lg shadow-md focus:outline-none hover:bg-orange-600 transition duration-300" onClick={() => handleEnrollClick(course._id)}>
                                            Apply
                                        </button>

                                    </div>
                                </div>


                            ))}
                        </Slider>
                    }

                    {showPopup && (
                        <div className="fixed inset-0 flex items-center justify-center">

                            <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/3  grid grid-cols-2">

                                <img src="https://t4.ftcdn.net/jpg/06/23/40/73/360_F_623407391_wtq6RVJUq2RGb2e3D0ykn5zJOqfJhOSc.jpg" className='h-full' alt="" />

                                <div className="p-6 text-left">

                                    <h2 className="text-xl font-bold text-teal-green-900 mb-4">{Eachcourse?.classTitle}</h2>
                                    {/* <p className="text-sm text-gray-600 ">Schedule :-  <span>{Eachcourse?.classSchedule}</span></p> */}
                                    <p className="text-sm text-gray-600 mb-6">Total Hours :- <span>{Eachcourse?.totalHours}</span></p>
                                    <button
                                        className="block w-full z-10 px-4 py-2 bg-orange-500 text-sm font-semibold text-white rounded-lg shadow-md  focus:outline-none "
                                        onClick={() => handleApplyCourse(selectedCourseId)}
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {showPopupEnroll && (
                        <div className="fixed inset-0 flex items-center justify-center">

                            <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/3">

                                <div className="p-6 text-left">
                                    <h2 className="text-xl font-bold text-teal-green-900 mb-4">Thankyou For Applying!!</h2>
                                    <p className="text-sm text-gray-600 mb-6">We Will connect you soon</p>
                                    <button
                                        className="block w-full px-4 py-2 bg-orange-500 text-sm font-semibold text-white rounded-lg shadow-md  focus:outline-none "
                                        onClick={handleEnrollClose}
                                    >
                                        close
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {popupMessage && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

                            <div className="bg-white p-4 rounded-lg shadow-md w-4/5 sm:w-3/5 lg:w-1/3">
                                <svg class="h-6 w-6 text-red-500 float-right -mt-2 cursor-pointer" onClick={() => setPopupMessage(null)} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                                <p className="text-lg font-bold mt-4 text-green-700">{popupMessage}</p>
                                {/* <button className="bg-orange-500 text-white py-2 px-4 rounded-md" onClick={() => setPopupMessage(null)}>Close</button> */}
                            </div>
                        </div>
                    )}


                    <style jsx global>{`
    .slick-prev,
    .slick-next {
        width: 50px;
        height: 50px;
        background-color: rgb(249 115 22);;
        border: 1px solid rgb(249 115 22);;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0px;
        position: absolute;
        top: 50%; 
        transform: translateY(-50%); 
        cursor: pointer;
        z-index: 1; /* Ensure the buttons are above the slider */
    }

    .slick-prev:hover,
    .slick-next:hover {
        background-color: rgb(249 115 22);; /* Darken the background color on hover */
    }

    .slick-prev {
        
        left: 10px;
    }

   

    .slick-next {
        right: 10px;
    }
   
    
   
    
`}</style>



                </div>

            </div>
        </>
    )
}

export default LanguageCourses