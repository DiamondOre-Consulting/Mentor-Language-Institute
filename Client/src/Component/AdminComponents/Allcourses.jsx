import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [searchQuery, setSearchQuery] = useState('');
  const [popup, setPopUp] = useState(false);
  const [courseid, setCourseId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllcourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/all-classes",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (response.status === 200) {
          const allcourses = response.data;
          setAllCourses(allcourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllcourses();
  }, [navigate]);

  const filteredCourses = allCourses.filter((course) =>
    course.classTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const openPopup = (courseid) => {
    setCourseId(courseid);
    setPopUp(true);
  };

  const closePopup = () => {
    setPopUp(false);
  };


  const deleteCourse = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // console.error("No token found");
        navigate("/login");
        return;
      }


      const deleteCourse = await axios.delete(
        `https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/delete-course/${courseid}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (deleteCourse.status === 200) {
        window.location.reload();
        setPopUp(false)
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
    }
  };

  return (
    <>
      <h1 className='text-4xl mb-1 font-semibold text-center'>All Courses</h1>
      <div className='w-44 rounded h-1 bg-orange-500 text-center mb-8 mx-auto'></div>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
        </div>
      )}

      <div className='flex justify-end mb-4 mr-4'>
        <input
          type='text'
          placeholder='Search course...'
          className='px-2 py-2 w-full border border-gray-400 rounded'
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
        {filteredCourses.map((course) => (
          <div
            key={course._id}
            className='block max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100'
          >
            <svg
              className="h-6 w-6 text-red-500 float-right cursor-pointer"
              onClick={() => openPopup(course._id)}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
            <h5 className='text-xl font-bold tracking-tight text-gray-900'>
              {course?.classTitle}
            </h5>
            <div className='w-22 h-0.5 border-rounded bg-orange-500 mb-6'></div>
            <p className='font-normal text-sm text-gray-700'>
              Duration :- <span>{course?.totalHours}hrs</span>
            </p>
            <p className='font-normal text-sm text-gray-700'>
              Enrolled Students :- <span>{course.enrolledStudents.length}</span>
              <Link to={`/admin-dashboard/allcourses/${course?._id}`} className='text-sm underline py-1 px-2 text-blue-500 text-sm rounded-md float-right'>View</Link>
            </p>
          </div>
        ))}
      </div>

      {popup && (
        <div id="modelConfirm" className="fixed z-50 inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full px-4">
          <div className="relative top-40 mx-auto shadow-xl rounded-md bg-white max-w-md">
            <div className="flex justify-end p-2">
              <button onClick={closePopup}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            <div className="p-6 pt-0 text-center">
              <svg className="w-20 h-20 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-xl font-normal text-gray-500 mt-5 mb-6">Are you sure you want to delete this Course?</h3>
              <a href="#" onClick={deleteCourse}
                className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2">
                Yes, I'm sure
              </a>
              <a href="#" onClick={closePopup}
                className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-cyan-200 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center"
                data-modal-toggle="delete-user-modal">
                No, cancel
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Allcourses;
