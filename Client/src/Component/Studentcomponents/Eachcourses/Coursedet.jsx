import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Tabs } from "flowbite-react";
import { HiAdjustments, HiClipboardList } from "react-icons/hi";
import { FaBook } from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";

const Coursedet = () => {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState("");
    const [classData, setClassData] = useState("");
    const [allEnrollclassData, setAllClassData] = useState([])

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
                    console.log("studetails", response.data);
                    const studentdetails = response.data;
                    setStudentData(studentdetails);

                    const classes = response.data.classes;
                    console.log("classes", classes)
                    const allEnrollClassData = [];

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
                            allEnrollClassData.push(classData);
                            
                            const teacherId = classResponse.data.teachBy;
                            const teacherResponse = await axios.get(`http://localhost:7000/api/students/teacher/${teacherId}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            if (teacherResponse.status === 200) {
                                // Add teacher information to class data
                                classResponse.data.teacher = teacherResponse.data;
                            }

                        }
                    }
                    setAllClassData(allEnrollClassData);
                    console.log("enroll class array", allEnrollclassData);


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
            <div className='p-10 md:p-20 '>
                <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
                    <div className='col-span-2'>
                        <h1 className='text-4xl font-bold'>{classData?.classTitle}</h1>
                        <div className='pt-4'>
                            <div className='flex justify-between'>
                                <div className='flex'>
                                    <img class="w-10 h-10 rounded-full" src="data:image/jpeg;base64,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" alt="Rounded avatar" />
                                    <div className='flex flex-col mx-2'>
                                        <p className='text-gray-700 font-bold'>Teacher</p>
                                        <p className='text-gray-600 -mt-1'>{classData.teacher?.name}</p>
                                    </div>
                                </div>

                                <div className='mx-2'>
                                    <p className='text-gray-700 font-bold'>Duration</p>
                                    <p className='text-gray-600 -mt-1'>{classData?.totalHours}hours</p>

                                </div>

                            </div>

                            {/* section */}
                            <div className='mt-10'>

                                <Tabs aria-label="Tabs with icons" style="underline">
                                    <Tabs.Item active title="Course Details" icon={FaBook} className="focus:outline-none" >
                                        <div className=''>
                                            <p className='text-2xl text-orange-500 font-bold mb-6'>Course Details</p>


                                            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                                                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                    <tbody>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                Student Name
                                                            </th>
                                                            <td class="px-6 py-4">
                                                                {studentData?.name}
                                                            </td>

                                                        </tr>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                Course Tilte
                                                            </th>
                                                            <td class="px-6 py-4">
                                                                {classData?.classTitle}
                                                            </td>

                                                        </tr>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                Teacher Name
                                                            </th>
                                                            <td class="px-6 py-4">
                                                            {classData.teacher?.name}
                                                            </td>
                                                        </tr>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                Total Hours
                                                            </th>
                                                            <td class="px-6 py-4">
                                                                {classData?.totalHours}hours
                                                            </td>

                                                        </tr>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                Course Price
                                                            </th>
                                                            <td class="px-6 py-4">
                                                                4000Rs
                                                            </td>

                                                        </tr>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                Schedule
                                                            </th>
                                                            <td class="px-6 py-4">
                                                                {classData?.classSchedule}
                                                            </td>
                                                        </tr>

                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                No of classes taken
                                                            </th>
                                                            <td class="px-6 py-4">
                                                                14hrs
                                                            </td>
                                                        </tr>


                                                    </tbody>
                                                </table>
                                            </div>


                                        </div>
                                    </Tabs.Item>
                                    <Tabs.Item title="Attendence Details" icon={MdDashboard} className="focus:outline-none">
                                        <div className=''>
                                            <p className='text-2xl text-orange-500 font-bold mb-6'>Attendence Details</p>


                                            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                                                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                    <thead class="text-xs text-gray-100 uppercase bg-orange-400 dark:bg-gray-700 dark:text-gray-400">
                                                        <tr>
                                                            <th scope="col" class="px-6 py-3">
                                                                Date
                                                            </th>
                                                            <th scope="col" class="px-6 py-3">
                                                                Status
                                                            </th>

                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                1/2/2024
                                                            </th>
                                                            <td class="px-6 py-4 text-green-600">
                                                                Present
                                                            </td>

                                                        </tr>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                2/2/2024
                                                            </th>
                                                            <td class="px-6 py-4 text-red-500">
                                                                Absesnt
                                                            </td>

                                                        </tr>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                3/2/2024
                                                            </th>
                                                            <td class="px-6 py-4 text-red-500">
                                                                Absent
                                                            </td>
                                                        </tr>



                                                    </tbody>
                                                </table>

                                            </div>
                                            <div className='mt-10 border-t-4 border-t-orange-500  w-1/3 p-2 rounded-md shadow-md'>
                                                <p>Total Classes : 42</p>
                                                <p>Total Class Taken : 12</p>
                                                <p>Total Absent : 4</p>
                                            </div>


                                        </div>
                                    </Tabs.Item>
                                    <Tabs.Item title="Fee Details" icon={HiAdjustments} className="focus:outline-none">
                                        <div className=''>
                                            <p className='text-2xl text-orange-500 font-bold mb-6'>Fee Details</p>


                                            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                                                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                    <thead class="text-xs text-gray-100 uppercase bg-orange-400 dark:bg-gray-700 dark:text-gray-400">
                                                        <tr>
                                                            <th scope="col" class="px-6 py-3">
                                                                Month
                                                            </th>
                                                            <th scope="col" class="px-6 py-3">
                                                                Status
                                                            </th>

                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                January
                                                            </th>
                                                            <td class="px-6 py-4 text-green-600">
                                                                Submitted
                                                            </td>

                                                        </tr>
                                                        <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                February
                                                            </th>
                                                            <td class="px-6 py-4 text-red-500">
                                                                Due
                                                            </td>

                                                        </tr>

                                                    </tbody>
                                                </table>

                                            </div>


                                        </div>
                                    </Tabs.Item>


                                </Tabs>

                            </div>

                            {/* section2 */}


                        </div>
                    </div>

                    <div className='flex'>
                        <div className='border border-0 rounded-md bl-4 w-1 h-60 bg-gradient-to-b from-orange-500 to-stone-200'></div>
                        <div className='flex'>
                            <div className='flex-col mx-3 cursor-pointer'>
                                <p className='text-gray-700 font-bold text-xl mb-2'>All Courses</p>
                                {allEnrollclassData.length === 0 ? (
                                    <p className='text-center font-bold bg-orange-400 p-4 flex items-center justify-center text-gray-200 rounded-md'>No Enrolled Courses are there</p>
                                ) : (
                                    allEnrollclassData.map((enroll) => (
                                        <div key={enroll._id}>
                                            <p className='py-1 hover:text-orange-500'>{enroll?.classTitle}</p>
                                        </div>
                                    ))
                                )}

                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </>
    )
}

export default Coursedet