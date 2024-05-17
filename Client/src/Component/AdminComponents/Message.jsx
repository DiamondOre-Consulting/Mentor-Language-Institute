import React, { useEffect, useState } from 'react';
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;


const Message = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stuDetails, setStuDetails] = useState([]);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [appliedCourseDetails, setAppliedCourseDetails] = useState([]);
  const [formData, setFormData] = useState({
    totalFee: '',
    feeMonth: '',
    paid: '',
    amountPaid: ''
  });
  const [popupMessage, setPopupMessage] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
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

        if (response.status === 200) {
          setAllStudents(response.data);

          // Filter students who have applied for any course
          const studentsWithCourses = response.data.filter(student => student.appliedClasses.length > 0);
          setStuDetails(studentsWithCourses);

          const appliedCourses = studentsWithCourses.map(student => student.appliedClasses.map(classId => {
            return {
              studentId: student._id,
              classId: classId
            };
          })).flat();

          const courseDetails = await Promise.all(appliedCourses.map(async course => {
            const classDetails = await axios.get(`http://localhost:7000/api/admin-confi/all-classes/${course.classId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            return {
              ...classDetails.data,
              studentId: course.studentId
            };
          }));

          setAppliedCourseDetails(courseDetails);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, []);

  const openForm = (studentId, classId) => {
    console.log("Clicked Accept for student ID:", studentId);
    console.log("Clicked Accept for course ID:", classId); // Console log the course ID
    setSelectedStudentId(studentId);
    setSelectedClassId(classId);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedStudentId('');
    setSelectedClassId('');
    setIsFormOpen(false);
    setPopupMessage('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  //  hendling feemonth


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
        console.error("No token found");
        return;
      }

      const { totalFee, feeMonth, paid, amountPaid } = formData;
      // const lowerCaseFeeMonth = feeMonth.toLowerCase();
      const monthNumber = monthNameToNumber[feeMonth];


      const response = await axios.put(
        `http://localhost:7000/api/admin-confi/enroll-student/${selectedClassId}/${selectedStudentId}`,
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
        console.log(response.data.message);
        setPopupMessage('Successfully Enrolled!');
        setIsFormOpen(false);
      } else if (response.status === 409) {
        console.log("Student already registered!");
        setPopupMessage('Student already Enrolled!');
        setIsFormOpen(false);;
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
            console.log("Student already registered!");
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

  // console.log(appliedCourseDetails.length)

  return (
    <>
     {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
        </div>
      )}

<h1 className='text-4xl mb-1 font-semibold text-center'>All Applied Students</h1>
      <div className='w-44 rounded h-1 bg-orange-500 text-center mb-12 mx-auto'></div>
      <div className='grid md:px-0 px-8 grid-cols-1 md:grid-cols-3 md:mt-0 mt-4 gap-4'>
        {stuDetails.map((student, index) => (
          <div className="flex items-start gap-2.5" key={index}>
            <div className="flex flex-col gap-1 w-full max-w-[320px]">
              <div className="leading-1.5 p-4 border-gray-200 bg-orange-500 shadow-md backdrop-filter backdrop-blur-md bg-opacity-20 rounded-e-xl rounded-es-xl ">
                <div>
                  <div className='flex items-center'>
                    <img className="w-8 h-8 rounded-full" src="https://static.vecteezy.com/system/resources/thumbnails/001/993/889/small/beautiful-latin-woman-avatar-character-icon-free-vector.jpg" alt="Jese image" />
                    <div className='flex flex-col ml-2'>
                      <span className="text-sm font-bold text-black ">{student.name}</span>
                      <span className="text-sm font-semibold text-gray-800 ">{student.phone}</span>
                    </div>
                  </div>
                  <div className='mt-4 h-20 overflow-y-auto'>
                    {appliedCourseDetails.map((course, i) => {
                      if (course.studentId === student._id) {
                        return (
                          <div key={i} className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-normal text-gray-900">Apply for <b>{course.classTitle}</b></p>
                           
                            </div>
                            <button className='text-ssm px-4 py-1 bg-gray-50 rounded-full' onClick={() => openForm(student._id, course._id)}>Accept</button>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white shadow-md rounded-md p-6 w-3/4 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Enroll Student</h2>
            <form onSubmit={handleSubmit}>
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

      {popupMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
          <div className="bg-white shadow-md rounded-md p-6">
            <p className="text-lg font-semibold">{popupMessage}</p>
            <button onClick={() => setPopupMessage('')} className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 mt-4">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
