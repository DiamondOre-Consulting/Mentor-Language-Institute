import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from "axios";



const Allstudents = () => {

    const [allStudents, setAllStudents] = useState([]);

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
                    "http://localhost:7000/api/admin-confi/all-students",
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



    return (
        <>

            <h1 className='text-4xl mb-1 font-semibold text-center'>All Students</h1>
            <div className='w-44 rounded h-1 bg-orange-500 text-center mb-8 mx-auto'></div>

            <div className='grid grid-cols-4 gap-2'>
                {allStudents.map((students) => (
                    <Link to={`/admin-dashboard/allstudents/${students?._id}`} class="block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer">
                        <h5 class="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{students.name}</h5>
                        <p class="font-normal text-sm text-gray-700 dark:text-gray-400">phone :- <span>{students.phone}</span></p>
                        <Link to={`/admin-dashboard/allstudents/${students?._id}`} className=' text-sm text-orange-500 flex items-center  text-md mt-4 justify-end '>Veiw <svg class="h-4 w-4 text-orange-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <polyline points="9 6 15 12 9 18" /></svg></Link>
                    </Link>
                ))}
            </div>

        </>
    )
}

export default Allstudents