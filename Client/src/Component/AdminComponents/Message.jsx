import React, { useEffect, useState } from 'react';
import axios from "axios";

const Message = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stuDetails, setStuDetails] = useState([]);
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

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
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
    };

    fetchAllStudents();
  }, []);

  const openForm = (studentId, classId) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const { totalFee, feeMonth, paid, amountPaid } = formData;

      const response = await axios.put(
        `http://localhost:7000/api/admin-confi/enroll-student/${selectedClassId}/${selectedStudentId}`,
        {
          totalFee,
          feeMonth,
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
        setPopupMessage('Successfully enrolled!');
        setIsFormOpen(false);
      } else if (response.status === 409) {
        console.log("Student already registered!");
        setPopupMessage('Student already registered!');
      }
    } catch (error) {
      console.error("Error enrolling students:", error);
      setPopupMessage('Error enrolling students!');
    }
  };

  return (
    <>
      <div className='grid grid-cols-4 gap-4'>
        {stuDetails.map((student, index) => (
          <div className="flex items-start gap-2.5" key={index}>
            <img className="w-8 h-8 rounded-full" src="https://static.vecteezy.com/system/resources/thumbnails/001/993/889/small/beautiful-latin-woman-avatar-character-icon-free-vector.jpg" alt="Jese image" />
            <div className="flex flex-col gap-1 w-full max-w-[320px]">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{student.name}</span>
              </div>
              {appliedCourseDetails.map((course, i) => {
                if (course.studentId === student._id) {
                  return (
                    <div key={i} className="flex flex-col leading-1.5 p-4 border-gray-200 bg-orange-500 shadow-md backdrop-filter backdrop-blur-md bg-opacity-20 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                      <div>
                        <p className="text-sm font-normal text-gray-900 dark:text-white">Apply for <b>{course.classTitle}</b> </p>
                        <p className='text-sm !float-right mt-2 cursor-pointer bg-gray-50 w-fit px-4 py-1 rounded-full' onClick={() => openForm(student._id, course._id)}>Accept</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white shadow-md rounded-md p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Enroll Student</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="totalFee" className="block text-sm font-medium text-gray-700">Total Fee:</label>
                <input type="text" id="totalFee" name="totalFee" value={formData.totalFee} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded-md w-full" required />
              </div>
              <div className="mb-4">
                <label htmlFor="feeMonth" className="block text-sm font-medium text-gray-700">Fee Month:</label>
                <input type="text" id="feeMonth" name="feeMonth" value={formData.feeMonth} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded-md w-full" required />
              </div>
              <div className="mb-4">
                <label htmlFor="paid" className="block text-sm font-medium text-gray-700">Paid:</label>
                <input type="text" id="paid" name="paid" value={formData.paid} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded-md w-full" required />
              </div>
              <div className="mb-4">
                <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">Amount Paid:</label>
                <input type="text" id="amountPaid" name="amountPaid" value={formData.amountPaid} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded-md w-full" required />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-2">Close</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {popupMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
          <div className="bg-white shadow-md rounded-md p-6">
            <p className="text-lg font-semibold">{popupMessage}</p>
            <button onClick={() => setPopupMessage('')} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
