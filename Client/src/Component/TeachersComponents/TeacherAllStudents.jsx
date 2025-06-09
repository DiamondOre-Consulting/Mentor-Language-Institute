import React, { useState, useEffect } from "react";
import axios from "axios";
import TeacherEditStudent from "./TeacherEditStudent";

const TeacherAllStudents = () => {
  const [studentList, setStudentList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const token = localStorage.getItem("token");

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(
        `https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/my-students`,
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
    console.log("clicked");
    setShowModal(false);
    setSelectedStudent(null);
    fetchStudentData();
  };

  const handleDeleteClick = async (id) => {
    try {
      const response = await axios.delete(
        `https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/delete-student/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      fetchStudentData();
    } catch (error) {}
  };

  const handleDownloadAttendance = async (studentId) => {
    const [year, month] = selectedMonthYear?.split("-");

    try {
      const response = await axios.get(
        `https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/download-student-attendance/${studentId}?year=${year}&month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Important for file download
        }
      );

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `attendance_${studentId}_${year}_${month}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download attendance", error);
    }
  };

  console.log(studentList);
  return (
    <div className="px-4 py-8">
      <div className="  ">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-left md:pt-0 pt-10">
          Student List
        </h2>

        <div className="mb-4 flex flex-col sm:flex-row gap-2 md:items-center">
          <label className="font-semibold">Select Month & Year: </label>
          <input
            type="month"
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center text-gray-700 border border-gray-200 shadow-sm">
            <thead className="text-xs uppercase bg-orange-500 text-white">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3">
                  Grade
                </th>
                <th scope="col" className="px-6 py-3">
                  DOB
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>

                <th scope="col" className="px-6 py-3">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody>
              {studentList.length > 0 ? (
                studentList.map((student, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-6 py-4">{student?.name || "N/A"}</td>
                    <td className="px-6 py-4">{student?.phone || "N/A"}</td>
                    <td className="px-6 py-4">{student?.grade || "N/A"}</td>

                    <td className="px-6 py-4">
                      {student?.dob
                        ? new Date(student?.dob).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(student)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit/
                        </button>

                        <button
                          onClick={() => handleDeleteClick(student?._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownloadAttendance(student?._id)}
                        className="bg-orange-500 text-gray-100 rounded-md px-2 py-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="lucide lucide-arrow-down-to-line-icon lucide-arrow-down-to-line animate-bounce"
                        >
                          <path d="M12 17V3" />
                          <path d="m6 11 6 6 6-6" />
                          <path d="M19 21H5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-xl max-w-md w-full relative">
            <TeacherEditStudent
              studentData={selectedStudent}
              closingModel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAllStudents;
