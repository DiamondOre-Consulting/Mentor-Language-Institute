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
  const [allCourses, setAllCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [showPopup, setShowPopup] = useState(false)
  const [status, setStatus] = useState(null)
  const [searchQuery, setSearchQuery] = useState('');
  const [setuId, setStuId] = useState(null)
  const [stuname , setStuName] = useState('');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [formData, setFormData] = useState({
    totalFee: '',
    feeMonth: '',
    paid: '',
    amountPaid: '',
  });
  // all students 

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
          // console.log("all students",response.data);
          const allstudents = response.data;
          // console.log(allstudents);
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


  // all courses 
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
          // console.log(response.data);
          const allcourses = response.data;
          // console.log(allcourses);
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


  // Filter students based on search query
  const filteredStudents = allStudents.filter((student) =>
    student.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };


  const openForm = (studentId) => {
    // console.log("Clicked Accept for student ID:", studentId);
    setSelectedStudentId(studentId);
    setIsFormOpen(true);

  };

  const openPopup = (studentId , studentName) => {
    setStuId(studentId);
    setStuName(studentName)
    setShowPopup(true)

  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const monthNameToNumber = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const token = localStorage.getItem("token");
      if (!token) {
        // console.error("No token found");
        return;
      }

      const { totalFee, feeMonth, paid, amountPaid } = formData;
      // const lowerCaseFeeMonth = feeMonth.toLowerCase();
      const monthNumber = monthNameToNumber[feeMonth];


      const response = await axios.put(
        `http://localhost:7000/api/admin-confi/enroll-student/${selectedCourseId}/${selectedStudentId}`,
        {
          totalFee,
          feeMonth: monthNumber,
          paid,
          amountPaid
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        // console.log(response.data.message);
        setPopupMessage('Successfully Enrolled!');
        setIsFormOpen(false);
      } else if (response.status === 409) {
        // console.log("Student already registered!");
        setPopupMessage('Student already Enrolled!');
        setIsFormOpen(false);;
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          // console.log("Student already registered!");
          setPopupMessage('Student already Enrolled!');
          setIsFormOpen(false);;
        }
        else {
          console.error("Error login teacher:", status);
          setError("Login Details Are Wrong!!");
        }
      }

    }
    finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setSelectedStudentId('');
    setIsFormOpen(false);
  };

  //  DETATIVE STUDENT ACCOUNT BY ADMIN
  // console.log(setuId)
  // console.log(status)
  const detailsctiveaccount = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // console.error("No token found");
        navigate("/login");
        return;
      }


      const deactiveResponse = await axios.put(
        `http://localhost:7000/api/admin-confi/deactivate-account/${setuId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (deactiveResponse.status === 201) {
        // console.log("Account has been deactivated");
        window.location.reload();
        setShowPopup(false)
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
    }
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

          <>


            <div

              className={`block max-w-sm p-4 ${student.deactivated ? 'bg-red-300 text-red-300 hover:text-red-400 hover:bg-red-400' : 'bg-white hover:bg-gray-100'}border border-gray-200 rounded-lg shadow     cursor-pointer`}

            >
              <div className='flex justify-between items-cetner'> <h5 className='text-xl font-bold tracking-tight text-gray-900 '>
                {student.name}
              </h5>  <span className='text-sm   text-xs text-gray-100 rounded-md'>
                  <svg onClick={() => openPopup(student._id , student.name)} class="h-6 w-6 text-red-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="4" y1="7" x2="20" y2="7" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg></span></div>

              <p className='font-normal text-sm text-gray-700 '>
                phone :- <span>{student.phone}</span>
              </p>
              <div className='flex justify-between mt-4'>
                <span className='text-sm bg-green-400 py-1 px-2 text-gray-100 rounded-md' onClick={() => openForm(student._id)}>Enroll </span>
                <Link key={student._id} to={`/admin-dashboard/allstudents/${student?._id}`} className='text-sm underline py-1 px-2 text-blue-500 text-sm rounded-md '>View</Link>

              </div>
              {/* <span className='flex justify-end bg-orange-500 rounded-full px-1 py-1 mb-1 justify-center text-center mt-4 text-gray-100'>
              Deactivate Account
            </span> */}
            </div>
          </>
        ))}
      </div>


      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white shadow-md rounded-md p-6 w-3/4 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Enroll Student</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="courses" className="block text-sm font-medium text-gray-700">All Courses</label>
                <select
                  className="w-full"
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  value={selectedCourseId}
                  required
                >
                  <option value="">Select Course</option>
                  {allCourses.map((course, index) => (
                    <option key={index} value={course._id}>{course.classTitle}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="totalFee" className="block text-sm font-medium text-gray-700">Total Fee:</label>
                <input type="text" id="totalFee" name="totalFee" value={formData.totalFee} onChange={handleChange} className="mt-1 p-2 border border-gray-500 rounded-md w-full" required />
              </div>
              <div className="mb-4">
                <label htmlFor="feeMonth" className="block text-sm font-medium text-gray-700">Fee Month:</label>
                <select
                  className="w-full"
                  onChange={(e) => setFormData({ ...formData, feeMonth: e.target.value })} // Update the formData state
                  value={formData.feeMonth} // Set the selected value to the formData state
                  required
                >
                  <option value="">Select Month</option>
                  {months.map((month, index) => (
                    <option key={index} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="paid" className="block text-sm font-medium text-gray-700">Paid:</label>
                <select value={formData.paid} onChange={(e) => setFormData({ ...formData, paid: e.target.value })} className="w-full">
                  <option>Select Status</option>
                  <option value="true">Yes</option>
                </select>

              </div>
              <div className="mb-4">
                <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">Amount Paid:</label>
                <input type="text" id="amountPaid" name="amountPaid" value={formData.amountPaid} onChange={handleChange} className="mt-1 p-2 border border-gray-500 rounded-md w-full" required />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-2">Close</button>
                <button type="submit" className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white shadow-md rounded-md p-6 w-3/4 max-w-md">
            <h2 className="text-lg font-semibold mb-4">{stuname}</h2>
            <form onSubmit={detailsctiveaccount}>


              <div className="mb-4">

                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full">
                  <option>Select Status</option>
                  <option value="false">Activate Account</option>
                  <option value="true">Deactivate Account</option>
                </select>

              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setShowPopup(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-2">Close</button>
                <button type="submit" className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {popupMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
          <div className="bg-white shadow-md rounded-md p-6">
            <p className="text-lg font-semibold">{popupMessage}</p>
            <button onClick={() => setPopupMessage('')} className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 mt-4">Close</button>
          </div>
        </div>
      )}

    </>
  )
}

export default Allstudents