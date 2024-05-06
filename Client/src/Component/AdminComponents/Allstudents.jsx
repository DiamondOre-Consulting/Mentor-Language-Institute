import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;




const Allstudents = () => {

    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchAllStudents = async () => {
            setLoading(true);
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
            finally {
                setLoading(false);
            }
        };


        fetchAllStudents();
    }, []);



    // Filter students based on search query
    const filteredStudents = allStudents.filter((student) =>
        student.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );

    // Handle search input change
    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };




    return (
        <>

            <h1 className='text-4xl mb-1 font-semibold text-center'>All Students</h1>
            <div className='w-44 rounded h-1 bg-orange-500 text-center mb-8 mx-auto'></div>
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
                </div>
            )}

            {/* Search bar */}
            <div className='flex justify-end mb-4 mr-4'>
                <input
                    type='text'
                    placeholder='Search student...'
                    className='px-2 py-2 border w-full border-gray-400 rounded'
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                />
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
        {filteredStudents.map((student) => (
          <Link
            to={`/admin-dashboard/allstudents/${student?._id}`}
            className='block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer'
            key={student._id}
          >
            <h5 className='mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
              {student.name}
            </h5>
            <p className='font-normal text-sm text-gray-700 dark:text-gray-400'>
              phone :- <span>{student.phone}</span>
            </p>
            <span className='flex justify-end bg-orange-500 rounded-full px-1 py-1 mb-1 justify-center text-center mt-4 text-gray-100'>
              Deactivate Account
            </span>
          </Link>
        ))}
      </div>

        </>
    )
}

export default Allstudents