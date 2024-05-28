import React, { useEffect, useState } from 'react'
import { Tabs } from "flowbite-react";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useJwt } from "react-jwt";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;


const Register = () => {

    const [activeTab, setActiveTab] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);



    const handleTabClick = (index) => {
        setActiveTab(index);
    };
    const { decodedToken } = useJwt(localStorage.getItem("token"));
    const token = localStorage.getItem("token");
    // console.log(token)
    // admin
    const [formValues, setFormValues] = useState({
        classTitle: "",
        // classSchedule: "",
        teachBy: "",
        totalHours: "",
    });

    // const [selectedDays, setSelectedDays] = useState({
    //     Mon: false,
    //     Tue: false,
    //     Wed: false,
    //     Thu: false,
    //     Fri: false,
    //     Sat: false,
    //     Sun: false,
    // });

    // const handleCheckboxChange = (event) => {
    //     const { name, checked } = event.target;
    //     setSelectedDays({ ...selectedDays, [name]: checked });
    // };


    const navigate = useNavigate();

    const handleAddCourse = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found");
                navigate("/login");
                return;
            }

            // let classScheduleString = '';

            // Object.entries(selectedDays).forEach(([day, isChecked]) => {
            //     if (isChecked) {
            //         classScheduleString += day.substring(0, 3) + ' ';
            //     }
            // });

            const formData = {
                classTitle: formValues.classTitle,
                teachBy: formValues.teachBy,
                totalHours: formValues.totalHours,
                // classSchedule: classScheduleString.trim(), // Ensure the schedule is trimmed
            };

            const response = await axios.post(
                "https://api.mentorlanguageinstitute.com/api/admin-confi/add-new-class",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                // console.log("New course has been added");
                setPopupMessage("New Course Has Been Added");
                setFormValues({
                    classTitle: "",
                    teachBy: "",
                    totalHours: "",
                });
                // setSelectedDays({
                //     Mon: false,
                //     Tue: false,
                //     Wed: false,
                //     Thu: false,
                //     Fri: false,
                //     Sat: false,
                //     Sun: false,
                // });
            } else if (response.status === 404) {
                // console.log("Admin not found");
                setPopupMessage("Admin not found");
            } else {
                // console.log("Error adding course:", response.status);
                setPopupMessage("Error adding course");
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 404) {
                    console.log("Admin not found");
                    setPopupMessage("Admin not found");
                } else {
                    console.error("Error adding course:", status);
                    setPopupMessage("Error adding course");
                }
            } else {
                console.error("Error adding course:", error.message);
                setPopupMessage("Error adding course");
            }
        }
        finally {
            setLoading(false);
        }
    };


    // fetch teacher data
    const [allTeachers, setAllTeachers] = useState([]);

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
                    "https://api.mentorlanguageinstitute.com/api/admin-confi/all-teachers",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (response.status == 200) {
                    // console.log(response.data);
                    const allteachers = response.data;
                    // console.log(allteachers);
                    setAllTeachers(allteachers);
                }
            } catch (error) {
                console.error("Error fetching associates:", error);

            }
        };

        fetchAllTeachers();
    }, []);


    //teacher 

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [popupMessage, setPopupMessage] = useState(null);

    const handleteacherRegister = async (e) => {
        setLoading(true);
        e.preventDefault();
        setPopupMessage(null)

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found");
                navigate("/login");
                return;
            }
            // console.log(token)

            const response = await axios.post(
                "https://api.mentorlanguageinstitute.com/api/admin-confi/add-teacher",
                {
                    name,
                    phone,
                    password,
                },

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log("Teacher added successfully");
                setPopupMessage("Teacher registered successfully");
                setName("");
                setPhone("");
                setPassword("");
            } else if (response.status === 409) {
                console.log("Teacher already registered");
                setPopupMessage("Teacher already registered");
            } else {
                console.log("Error adding teacher:", response.status);
                setPopupMessage("Error registering teacher");
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 409) {
                    console.log("Teacher already registered");
                    setPopupMessage("Teacher already registered");
                } else {
                    console.error("Error adding teacher:", status);
                    setPopupMessage("Error registering teacher");
                }
            } else {
                console.error("Error adding teacher:", error.message);
                setPopupMessage("Error registering teacher");
            }
        }
        finally {
            setLoading(false);
        }
    };


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues({ ...formValues, [name]: value });
    };

    // register students

    const handleStudentRegister = async (e) => {
        setLoading(true);
        e.preventDefault();
        setPopupMessage(null)

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found");
                navigate("/login");
                return;
            }
            console.log(token)

            const response = await axios.post(
                "https://api.mentorlanguageinstitute.com/api/admin-confi/add-student",
                {
                    name,
                    phone,
                    password,
                },

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log("student added successfully");
                setPopupMessage("Student Registered Successfully");
                setName("");
                setPhone("");
                setPassword("");
            } else if (response.status === 409) {
                console.log("student already registered");
                setPopupMessage("Student Already Registered");
            } else {
                console.log("Error adding student:", response.status);
                setPopupMessage("Error Registering Student");
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 409) {
                    console.log("Student already registered");
                    setPopupMessage("Student Already Registered");
                } else {
                    console.error("Error adding Student:", status);
                    setPopupMessage("Error Registering Student");
                }
            } else {
                console.error("Error adding student:", error.message);
                setPopupMessage("Error Registering Student");
            }
        }
        finally {
            setLoading(false);
        }
    };


    return (
        <div className=''>
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
                </div>
            )}
            <div className="flex flex-col justify-center items-center">
                <div className="flex space-x-2 md:space-x-4">
                    <button
                        className={`py-2 px-0 md:px-4 border-b-2 ${activeTab === 0 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                    >
                        Register Student
                    </button>
                    <button
                        className={`py-2 px-0 md:px-4 border-b-2 ${activeTab === 1 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                    >
                        Register Teacher
                    </button>
                    <button
                        className={`py-2 px-0 md:px-4 border-b-2 ${activeTab === 2 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                        onClick={() => handleTabClick(2)}
                    >
                        Add New Courses
                    </button>
                </div>
                <div className="py-4">
                    {activeTab === 0 && (
                        <section class="w-full">
                            <div class="flex flex-col items-center justify-center px-6 py-8 w-full">
                                <div class="w-full max-w-screen-xl bg-white rounded-lg shadow  md:mt-0 sm:max-w-md xl:p-0  ">
                                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                        <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl  md:mx-20">
                                            Register Student
                                        </h1>
                                        <div className=' md:w-22 h-0.5 bg-orange-500 border-rounded'></div>
                                        <form class="space-y-4 md:space-y-6" onSubmit={handleStudentRegister}>
                                            <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900  w-full">Name</label>
                                                <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} class=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      " placeholder="Enter Student Name" required="" />
                                            </div>
                                            <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900 ">Phone</label>
                                                <input type="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter Phone No" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      " required="" />
                                            </div>
                                            <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900 ">Password</label>
                                                <input type={showPassword ? "text" : "password"} name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      " required="" />
                                            </div>
                                            <div class="flex items-center mt-2">
                                                <input type="checkbox" class="mr-2" onChange={() => setShowPassword(!showPassword)} />
                                                <label class="text-sm font-medium text-gray-900  cursor-pointer" onClick={() => setShowPassword(!showPassword)}>Show Password</label>
                                            </div>

                                            <button className='bg-orange-400 py-2 w-full rounded-md text-white'>Submit</button>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                    {activeTab === 1 && (
                        <section class="w-full">
                            <div class="flex flex-col items-center justify-center px-6 py-8 w-full">
                                <div class="w-full max-w-screen-xl bg-white rounded-lg shadow  md:mt-0 sm:max-w-md xl:p-0  ">
                                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                        <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl  md:mx-20">
                                            Register Teacher
                                        </h1>
                                        <div className='w-22 h-0.5 bg-orange-500 border-rounded'></div>
                                        <form class="space-y-4 md:space-y-6" action="#" onSubmit={handleteacherRegister}>
                                            <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900  w-full">Name</label>
                                                <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} class=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      " placeholder="Enter Teacher Name" required="" />
                                            </div>
                                            <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900 ">Phone</label>
                                                <input type="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter Phone No" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      " required="" />
                                            </div>
                                            <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900 ">Password</label>
                                                <input type={showPassword ? "text" : "password"} name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5      " required="" />
                                            </div>
                                            <div class="flex items-center mt-2">
                                                <input type="checkbox" class="mr-2" onChange={() => setShowPassword(!showPassword)} />
                                                <label class="text-sm font-medium text-gray-900  cursor-pointer" onClick={() => setShowPassword(!showPassword)}>Show Password</label>
                                            </div>

                                            <button className='bg-orange-400 py-2 w-full rounded-md text-white'>Submit</button>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                    {activeTab === 2 && (
                        <section class="w-full">
                            <div class="flex flex-col items-center justify-center px-6 py-8 w-full">
                                <div class="w-full max-w-screen-xl bg-white rounded-lg shadow  md:mt-0 sm:max-w-md xl:p-0  ">
                                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                        <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl  md:mx-20">
                                            Add New Course
                                        </h1>
                                        <div className='w-22 h-0.5 bg-orange-500 border-rounded'></div>
                                        <form class="space-y-4 md:space-y-6" action="#" onSubmit={handleAddCourse}>
                                            <div>
                                                <label for="classTitle" class="block mb-2 text-sm font-medium text-gray-900  w-full">Class Title</label>
                                                <input type="text" name="classTitle" onChange={handleInputChange} value={formValues.classTitle} class=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5      " placeholder="Enter Course Title" required="" />
                                            </div>
                                            <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900 ">Total Hours</label>
                                                <input type="text" name="totalHours" onChange={handleInputChange} value={formValues.totalHours} placeholder="Enter Total Hours" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5      " required="" />
                                            </div>
                                            <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900 ">Teach By</label>
                                                <select
                                                    id="teachBy"
                                                    name="teachBy"
                                                    value={formValues.teachBy}
                                                    onChange={(e) => setFormValues({ ...formValues, teachBy: e.target.value })}
                                                    className="w-full rounded border px-3 py-2 text-gray-800 outline-none ring-gray-700 transition duration-100 focus:ring"
                                                >
                                                    <option value="">Select Teacher</option>
                                                    {allTeachers.map((teacher) => (
                                                        <option key={teacher._id} value={teacher._id}>
                                                            {teacher.UniqueCode ? `${teacher.UniqueCode}` : `${teacher.name}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {/* <div>
                                                <label class="block mb-2 text-sm font-medium text-gray-900 ">Schedule</label>
                                                <ul className="flex flex-wrap items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex sm: sm: sm:">

                                                    {Object.entries(selectedDays).map(([day, isChecked]) => (
                                                        <li
                                                            key={day}
                                                            class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r "
                                                        >
                                                            <div class="flex items-center ps-3">
                                                                <input
                                                                    id={`${day}-checkbox-list`}
                                                                    type="checkbox"
                                                                    name={day}
                                                                    checked={isChecked}
                                                                    onChange={handleCheckboxChange}
                                                                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500    focus:ring-2  -gray-500"
                                                                />
                                                                <label
                                                                    for={`${day}-checkbox-list`}
                                                                    class="w-full py-3 ms-2 text-sm font-medium text-gray-900 "
                                                                >
                                                                    {day}
                                                                </label>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div> */}

                                            <button className='bg-orange-400 py-2 w-full rounded-md text-white'>Submit</button>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {popupMessage && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <svg class="h-6 w-6 text-red-500 float-right -mt-2 cursor-pointer" onClick={() => setPopupMessage(null)} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                        <p className="text-lg font-bold mt-4 text-green-700">{popupMessage}</p>
                        {/* <button className="bg-orange-500 text-white py-2 px-4 rounded-md" onClick={() => setPopupMessage(null)}>Close</button> */}
                    </div>
                </div>
            )}

        </div>


    )
}

export default Register