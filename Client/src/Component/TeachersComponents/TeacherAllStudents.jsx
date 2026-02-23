import React, { useState, useEffect } from "react";
import { useApi } from "../../api/useApi";
import TeacherEditStudent from "./TeacherEditStudent";
import { toast } from "sonner";

const TeacherAllStudents = () => {
  const { get, put, del } = useApi();
  const [courseGroups, setCourseGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [status, setStatus] = useState(null);

  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    try {
      const response = await get({
        url: `/teachers/my-classes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response?.status === 200) {
        setCourses(response?.data || []);
        return response?.data || [];
      }
    } catch (error) {
      console.log(error);
    }
    return [];
  };

  const fetchStudentsByCourseList = async (courseList) => {
    try {
      const responses = await Promise.allSettled(
        courseList.map((course) =>
          get({
            url: `/teachers/class/all-students/${course._id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).unwrap()
        )
      );

      const nextGroups = responses
        .map((result, index) => {
          if (result.status !== "fulfilled") return null;
          return {
            course: courseList[index],
            students: result.value?.data || [],
          };
        })
        .filter(Boolean);

      setCourseGroups(nextGroups);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!courses.length) {
      setCourseGroups([]);
      return;
    }
    const filteredCourses =
      selectedCourseId === "all"
        ? courses
        : courses.filter((course) => course._id === selectedCourseId);
    fetchStudentsByCourseList(filteredCourses);
  }, [courses, selectedCourseId]);

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    const filteredCourses =
      selectedCourseId === "all"
        ? courses
        : courses.filter((course) => course._id === selectedCourseId);
    fetchStudentsByCourseList(filteredCourses);
  };

  const handleDeleteClick = async (id) => {
    try {
      await del({
        url: `/teachers/delete-student/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      const filteredCourses =
        selectedCourseId === "all"
          ? courses
          : courses.filter((course) => course._id === selectedCourseId);
      fetchStudentsByCourseList(filteredCourses);
    } catch (error) {}
  };

  const handleActiveAndDeactivateStudent = async (status, id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const deactiveResponse = await put({
        url: `/teachers/deactivate-account/${id}`,
        data: { status },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      const filteredCourses =
        selectedCourseId === "all"
          ? courses
          : courses.filter((course) => course._id === selectedCourseId);
      await fetchStudentsByCourseList(filteredCourses);
      if (deactiveResponse.status === 201) {
        toast.success(
          `Student ${status ? "Deactivated" : "Activated"} successfully`
        );
        // setShowPopup(false);
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
    }
  };

  const handleDownloadAttendance = async (studentId) => {
    const [year, month] = selectedMonthYear?.split("-");

    try {
      const response = await get({
        url: `/teachers/download-student-attendance/${studentId}?year=${year}&month=${month}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important for file download
      }).unwrap();

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

  return (
    <div className="px-4 py-8">
      <div className="  ">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-left md:pt-0 pt-10">
          Student List
        </h2>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="font-semibold">Select Month & Year:</label>
            <input
              type="month"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="font-semibold">Filter by Course:</label>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.classTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {courseGroups.length > 0 ? (
          courseGroups.map((group) => (
            <div key={group.course?._id} className="mb-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-slate-800">
                  {group.course?.classTitle}
                </h3>
                <span className="text-sm text-slate-600">
                  {group.students.length} student(s)
                </span>
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
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.students.length > 0 ? (
                      group.students.map((student, index) => (
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
                                Edit
                              </button>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <label class="switch">
                              <input
                                type="checkbox"
                                checked={student?.deactivated}
                                onChange={(e) =>
                                  handleActiveAndDeactivateStudent(
                                    e.target.checked,
                                    student?._id
                                  )
                                }
                              />
                              <span class="slider">
                                <svg
                                  class="slider-icon"
                                  viewBox="0 0 32 32"
                                  xmlns="http://www.w3.org/2000/svg"
                                  aria-hidden="true"
                                  role="presentation"
                                >
                                  <path fill="none" d="m4 16.5 8 8 16-16"></path>
                                </svg>
                              </span>
                            </label>
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
                          colSpan="7"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No students found for this course.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            No students found.
          </div>
        )}
      </div>

      {showModal && (
        <div className="app-modal-overlay">
          <div className="app-modal-card app-modal-card-md relative p-4">
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

