import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from "axios";


const AllTeachers = () => {

  const [allTeachers, setAllTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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
          "http://localhost:7000/api/admin-confi/all-teachers",
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
        console.error("Error fetching courses:", error);

      }
    };

    fetchAllTeachers();
  }, []);



  // filter 
  const filteredTeachers = allTeachers.filter((teacher) =>
    teacher.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };


  return (
    <>

      <h1 className='text-4xl mb-1 font-semibold text-center'>All Teachers</h1>
      <div className='w-44 rounded h-1 bg-orange-500 text-center mb-16 mx-auto'></div>

      {/* Search bar */}
      <div className='flex justify-end mb-4 mr-4'>
        <input
          type='text'
          placeholder='Search teacher...'
          className='px-2 py-2 w-full border border-gray-400 rounded'
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
      </div>

      <div class=" grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-8 gap-8 mt-8">
        {filteredTeachers.map((teacher) => (
          <Link to={`/admin-dashboard/allteacher/${teacher?._id}`} href="#" class="flex flex-col items-center justify-center text-gray-800 hover:text-blue-600" title="View Profile">
            <img src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=" class="w-24 rounded-full" />
            <p class="text-center font-bold text-sm mt-1">{teacher?.name}</p>
            <p class="text-xs text-gray-500 text-center">{teacher?.phone}</p>
          </Link>
        ))}
        {/* <Link to={`/admin/all-candidates/${latestCandidate?._id}`} */}


      </div>



    </>

  )
}

export default AllTeachers