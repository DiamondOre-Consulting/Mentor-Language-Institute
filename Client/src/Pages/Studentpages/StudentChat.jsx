import React, { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import { useJwt } from 'react-jwt'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@react-hook/media-query';

const StudentChat = () => {
  
    const navigate = useNavigate();
    const { decodedToken } = useJwt(localStorage.getItem("token"));
    const userName = decodedToken ? decodedToken.name : "No Name Found";
    const [classData, setClassData] = useState([]);
    const [teacherData, setTeacherData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isTeacherSectionVisible, setIsTeacherSectionVisible] = useState(true);
    const isSmallScreen = useMediaQuery('(max-width: 640px)'); 



    const token = localStorage.getItem("token");

    if (!token) {
        navigate("/student-login");
        return;
    }

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {

            navigate("/student-login");
        } else {
            const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds

            if (tokenExpiration && tokenExpiration < Date.now()) {
                // Token expired, remove from local storage and redirect to login page
                localStorage.removeItem("token");
                navigate("/student-login");
            }
        }
    }, [decodedToken])


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

    const handleTeacherClick = (teacher) => {
        setSelectedTeacher(teacher); // Set selected teacher when clicked
    
        // Check if it's a small screen and the left bar is open
        if (isSmallScreen && !isOpen) {
            setIsTeacherSectionVisible(false);
            setIsOpen(true); // Open the right portion
        } else if (isSmallScreen && isOpen) {
            setIsOpen(false); 
              setIsTeacherSectionVisible(true); // Close the right portion
        }
        
    };

    const handleClick = () => {
        console.log("navigating.............")
        navigate(-1)
      };

    return (
        <>

            <div>
               

              
                    <div class=" h-screen">
                        <div class="md:flex border border-grey rounded shadow-lg h-full">

                        {isTeacherSectionVisible && (
                        <div className={`md:w-1/3 border flex flex-col ${isSmallScreen && !isOpen ? 'w-full' : ''}`}>
                            {/* Left portion */}


                                <div class="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
                                    <div className='flex items-center'>
                                        <img class="w-10 h-10 rounded-full" src="https://static.thenounproject.com/png/363640-200.png" />
                                        <span className='ml-1'>{userName}</span>
                                    </div>

                                    <div class="flex">
                                    <svg class="h-8 w-8 text-gray-700 cursor-pointer"  onClick={handleClick}  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="5" y1="12" x2="19" y2="12" />  <line x1="5" y1="12" x2="9" y2="16" />  <line x1="5" y1="12" x2="9" y2="8" /></svg>
                                    </div>
                                </div>

                                <div class="py-2 px-2 bg-grey-lightest">
                                    <input type="text" class="w-full px-2 py-2 text-sm" placeholder="Search or start new chat" />
                                </div>

                                <div class="bg-grey-lighter flex-1 overflow-auto">
                                {teacherData.map((teacher, index) => (
                                    <div class="bg-white px-3 flex items-center hover:bg-grey-lighter cursor-pointer sm:pointer"  onClick={() => handleTeacherClick(teacher)}>
                                        <div>
                                            <img class="h-12 w-12 rounded-full"
                                                src="https://static.thenounproject.com/png/363640-200.png" />
                                        </div>
                                        <div class="ml-4 flex-1 border-b border-grey-lighter py-4">
                                            <div class="flex items-bottom justify-between">
                                                <p class="text-grey-darkest">
                                                    {teacher.name}
                                                </p>
                                                <p class="text-xs text-grey-darkest">
                                                    12:45 pm
                                                </p>
                                            </div>
                                            <p class="text-grey-dark mt-1 text-sm">
                                                Show me the money!
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                    
                                </div>

                            </div>
)}

                            <div className={`md:w-2/3 border md:flex flex-col ${isOpen ? 'w-full h-full' : 'hidden'}`}>

                                <div class="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
                                    <div class="flex items-center">
                                        <div>
                                            <img class="w-10 h-10 rounded-full" src="https://static.thenounproject.com/png/363640-200.png" />
                                        </div>
                                        <div class="ml-4">
                                            <p class="text-grey-darkest">
                                            {selectedTeacher && <h1>{selectedTeacher.name}</h1>}
                                            </p>
                                          
                                        </div>
                                    </div>

                                    <div class="flex">
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fill-opacity=".5" d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path></svg>
                                        </div>
                                        <div class="ml-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fill-opacity=".5" d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"></path></svg>
                                        </div>
                                        <div class="ml-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fill-opacity=".6" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
                                        </div>
                                    </div>
                                </div>


                                <div class="flex-1 overflow-auto bg-gray-200" >
                                    <div class="py-2 px-3">

                                        <div class="flex justify-center mb-2">
                                            <div class="rounded py-2 px-4 bg-blue-100" >
                                                <p class="text-sm uppercase">
                                                    February 20, 2018
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex justify-center mb-4">
                                            <div class="rounded py-2 px-4 bg-yellow-200" >
                                                <p class="text-xs">
                                                    Messages to this chat and calls are now secured with end-to-end encryption. Tap for more info.
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex mb-2">
                                            <div class="rounded py-2 px-3 bg-gray-200" >
                                                <p class="text-sm text-teal">
                                                    Sylverter Stallone
                                                </p>
                                                <p class="text-sm mt-1">
                                                    Hi everyone! Glad you could join! I am making a new movie.
                                                </p>
                                                <p class="text-right text-xs text-grey-dark mt-1">
                                                    12:45 pm
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex mb-2">
                                            <div class="rounded py-2 px-3 bg-gray-200">
                                                <p class="text-sm text-purple">
                                                    Tom Cruise
                                                </p>
                                                <p class="text-sm mt-1">
                                                    Hi all! I have one question for the movie
                                                </p>
                                                <p class="text-right text-xs text-grey-dark mt-1">
                                                    12:45 pm
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex mb-2">
                                            <div class="rounded py-2 px-3 bg-gray-200">
                                                <p class="text-sm text-orange">
                                                    Harrison Ford
                                                </p>
                                                <p class="text-sm mt-1">
                                                    Again?
                                                </p>
                                                <p class="text-right text-xs text-grey-dark mt-1">
                                                    12:45 pm
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex mb-2">
                                            <div class="rounded py-2 px-3 bg-gray-200">
                                                <p class="text-sm text-orange">
                                                    Russell Crowe
                                                </p>
                                                <p class="text-sm mt-1">
                                                    Is Andrés coming for this one?
                                                </p>
                                                <p class="text-right text-xs text-grey-dark mt-1">
                                                    12:45 pm
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex mb-2">
                                            <div class="rounded py-2 px-3 bg-gray-200">
                                                <p class="text-sm text-teal">
                                                    Sylverter Stallone
                                                </p>
                                                <p class="text-sm mt-1">
                                                    He is. Just invited him to join.
                                                </p>
                                                <p class="text-right text-xs text-grey-dark mt-1">
                                                    12:45 pm
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex justify-end mb-2">
                                            <div class="rounded py-2 px-3 bg-green-100">
                                                <p class="text-sm mt-1">
                                                    Hi guys.
                                                </p>
                                                <p class="text-right text-xs text-grey-dark mt-1">
                                                    12:45 pm
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex justify-end mb-2">
                                            <div class="rounded py-2 px-3 bg-green-100">
                                                <p class="text-sm mt-1">
                                                    Count me in
                                                </p>
                                                <p class="text-right text-xs text-grey-dark mt-1">
                                                    12:45 pm
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex mb-2">
                                            <div class="rounded py-2 px-3 bg-gray-200">
                                                <p class="text-sm text-purple">
                                                    Tom Cruise
                                                </p>
                                                <p class="text-sm mt-1">
                                                    Get Andrés on this movie ASAP!
                                                </p>
                                                <p class="text-right text-xs text-grey-dark mt-1">
                                                    12:45 pm
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                </div>


                                <div class="bg-grey-lighter px-4 py-4 flex items-center">
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path opacity=".45" fill="#263238" d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"></path></svg>
                                    </div>
                                    <div class="flex-1 mx-4">
                                        <input class="w-full border rounded px-2 py-2" type="text" />
                                    </div>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fill-opacity=".45" d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2z"></path></svg>
                                    </div>
                                </div>
                            </div>

                        </div>
                  
                </div>
            </div>


            {/* <div className="flex h-screen antialiased text-gray-800">
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
            </div> */}
        </>
    )
}

export default StudentChat