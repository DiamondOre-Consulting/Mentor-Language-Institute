import React, { useState, useEffect } from "react";
import axios from "axios";
import TeacherEditStudent from "./TeacherEditStudent";


const TeacherAllStudents = () => {
  const [studentList, setStudentList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const token = localStorage.getItem("token");

 

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7000/api/teachers/my-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudentList(response?.data);
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };


    const closeModal = () => {
    console.log("clicked")
    setShowModal(false);
    setSelectedStudent(null);
    fetchStudentData()
  };

  const handleDeleteClick = async(id) =>{
    try {
      const response = await axios.delete(`http://localhost:7000/api/teachers/delete-student/${id}`,
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log(response)
      fetchStudentData()
    } catch (error) {
      
    }
  }

 
  return (
    <div className="relative">
      <div className="px-2">
        <div className="mt-8 text-3xl">Student List</div>
        <table className="w-full text-sm text-center text-gray-500 shadow-xl rtl:text-right mt-2 ">
          <thead className="text-xs text-gray-100 uppercase bg-orange-500">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Phone</th>
              <th scope="col" className="px-6 py-3">DOB</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {studentList.length > 0 ? (
              studentList.map((student, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-6 py-4">{student.name || "N/A"}</td>
                  <td className="px-6 py-4">{student.phone || "N/A"}</td>
                  <td className="px-6 py-4">
                    {student?.dob ? new Date(student?.dob).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 flex items-center justify-center space-x-4 py-4">
                    <button
                      onClick={() => handleEditClick(student)}
                      className="text-red-700 underline"
                    >
                      Edit
                    </button>


                     <button
                      onClick={() => handleDeleteClick(student?._id)}
                      className="text-red-700 underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-xl max-w-md w-full relative">
            <TeacherEditStudent studentData={selectedStudent} closingModel={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAllStudents;
