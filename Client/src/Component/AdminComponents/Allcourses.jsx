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


const Allcourses = () => {

  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllcourses = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }


        const response = await axios.get(
          "http://localhost:7000/api/admin-confi/all-classes",
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
      finally {
        setLoading(false);
      }
    };

    fetchAllcourses();
  }, []);


  return (
    <>
      <h1 className='text-4xl mb-1 font-semibold text-center'>All Courses</h1>
      <div className='w-44 rounded h-1 bg-orange-500 text-center mb-8 mx-auto'></div>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
        </div>
      )}

      <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>

        {allCourses.map((course) => (
          <Link to={`/admin-dashboard/allcourses/${course?._id}`} class="block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

            <h5 class=" text-xl font-bold tracking-tight text-gray-900 dark:text-white">{course?.classTitle}</h5>
            <div className='w-22 h-0.5 border-rounded bg-orange-500 mb-6'></div>
            {/* <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Schedule :- <span>{course?.classSchedule}</span></p> */}
            <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Duration :- <span>{course?.totalHours}hrs</span></p>
            <p class="font-normal text-sm text-gray-700 dark:text-gray-400">Enrolled Students :- <span>{course.enrolledStudents.length}</span></p>
          </Link>
        ))}
      </div>
    </>
  )
}

export default Allcourses