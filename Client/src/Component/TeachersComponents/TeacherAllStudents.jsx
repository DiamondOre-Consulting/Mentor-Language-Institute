import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { useApi } from "../../api/useApi";
import TeacherEditStudent from "./TeacherEditStudent";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const TeacherAllStudents = () => {
  const navigate = useNavigate();
  const { get, put, del } = useApi();
  const [allStudents, setAllStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [status, setStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [setuId, setStuId] = useState(null);
  const [stuname, setStuName] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  const [filterMode, setFilterMode] = useState("all");
  const [selectedMyCourseId, setSelectedMyCourseId] = useState("");
  const [myCourseStudents, setMyCourseStudents] = useState([]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [formData, setFormData] = useState({
    totalFee: "",
    feeMonth: "",
    paid: "pending",
    amountPaid: "0",
  });

  useEffect(() => {
    const fetchAllStudents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await get({
          url: "/teachers/all-students",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (response.status === 200) {
          setAllStudents(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, [navigate]);

  useEffect(() => {
    const fetchAllcourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await get({
          url: "/teachers/my-classes",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (response.status === 200) {
          const courses = response.data || [];
          setAllCourses(courses);
          if (!selectedMyCourseId && courses.length > 0) {
            setSelectedMyCourseId(courses[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllcourses();
  }, [navigate, selectedMyCourseId]);

  const fetchStudentsForMyCourse = async (courseId) => {
    if (!courseId) {
      setMyCourseStudents([]);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await get({
        url: `/teachers/class/all-students/${courseId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status === 200) {
        setMyCourseStudents(response.data || []);
      } else {
        setMyCourseStudents([]);
      }
    } catch (error) {
      console.error("Error fetching course students:", error);
      setMyCourseStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterMode === "my" && selectedMyCourseId) {
      fetchStudentsForMyCourse(selectedMyCourseId);
    }
    if (filterMode === "my" && !selectedMyCourseId && allCourses.length > 0) {
      setSelectedMyCourseId(allCourses[0]._id);
    }
  }, [filterMode, selectedMyCourseId, allCourses.length]);

  useEffect(() => {
    const hasOpenModal =
      isFormOpen ||
      showPopup ||
      !!popupMessage ||
      loading ||
      showDeletePopup ||
      showEditModal ||
      showViewModal;
    document.body.style.overflow = hasOpenModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    isFormOpen,
    showPopup,
    popupMessage,
    loading,
    showDeletePopup,
    showEditModal,
    showViewModal,
  ]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sourceList = filterMode === "my" ? myCourseStudents : allStudents;
    if (!query) return sourceList;
    return sourceList.filter((student) =>
      student.name?.toLowerCase().includes(query)
    );
  }, [allStudents, myCourseStudents, searchQuery, filterMode]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const openForm = (studentId) => {
    setSelectedStudentId(studentId);
    setIsFormOpen(true);
  };

  const openPopup = (studentId, studentName) => {
    setStuId(studentId);
    setStuName(studentName);
    setShowPopup(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaidChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      paid: value,
      amountPaid: value === "pending" ? "0" : prev.amountPaid,
    }));
  };

  const monthNameToNumber = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const { totalFee, feeMonth, paid, amountPaid } = formData;
      const monthNumber = monthNameToNumber[feeMonth];
      const isPaid = paid === "yes";
      const normalizedAmountPaid = isPaid ? Number(amountPaid) : 0;

      const response = await put({
        url: `/teachers/enroll-student/${selectedCourseId}/${selectedStudentId}`,
        data: {
          totalFee: Number(totalFee),
          feeMonth: monthNumber,
          paid: isPaid,
          amountPaid: normalizedAmountPaid,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        if (isPaid) {
          setPopupMessage("Student enrolled and invoice sent.");
        } else {
          setPopupMessage("Student enrolled.");
        }
        setAllStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === selectedStudentId
              ? {
                  ...student,
                  classes: Array.from(
                    new Set([...(student.classes || []), selectedCourseId])
                  ),
                }
              : student
          )
        );
        if (filterMode === "my" && selectedMyCourseId) {
          fetchStudentsForMyCourse(selectedMyCourseId);
        }
        closeForm();
      } else if (response.status === 409) {
        setPopupMessage("Student already Enrolled!");
        setIsFormOpen(false);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setPopupMessage("Student already Enrolled!");
      } else {
        setPopupMessage("Unable to enroll student right now.");
      }
      setIsFormOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setSelectedStudentId("");
    setSelectedCourseId("");
    setFormData({
      totalFee: "",
      feeMonth: "",
      paid: "pending",
      amountPaid: "0",
    });
    setIsFormOpen(false);
  };

  const detailsctiveaccount = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const deactiveResponse = await put({
        url: `/teachers/deactivate-account/${setuId}`,
        data: { status },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (deactiveResponse.status === 201) {
        setAllStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === setuId
              ? { ...student, deactivated: status === "true" }
              : student
          )
        );
        if (filterMode === "my" && selectedMyCourseId) {
          fetchStudentsForMyCourse(selectedMyCourseId);
        }
        setShowPopup(false);
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
    }
  };

  const deleteStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await del({
        url: `/teachers/delete-student/${deleteId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Student Deleted Successfully");
        setAllStudents(allStudents.filter((s) => s._id !== deleteId));
        if (filterMode === "my" && selectedMyCourseId) {
          fetchStudentsForMyCourse(selectedMyCourseId);
        }
        setShowDeletePopup(false);
      }
    } catch (error) {
      console.log("");
    }
  };

  const openDeletePopup = (id) => {
    setDeleteId(id);
    setShowDeletePopup(true);
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
    if (filterMode === "my" && selectedMyCourseId) {
      fetchStudentsForMyCourse(selectedMyCourseId);
    }
  };

  const handleViewClick = (student) => {
    setViewStudent(student);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setViewStudent(null);
    setShowViewModal(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-white to-orange-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">All Students</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage enrollments, profile actions, and account status in one place.
              </p>
            </div>

            <div className="w-full max-w-md">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>

                <input
                  type="text"
                  placeholder="Search student by name..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  style={{ paddingLeft: "3rem" }}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="studentFilter"
                  value="all"
                  checked={filterMode === "all"}
                  onChange={() => setFilterMode("all")}
                />
                <span>All Students</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="studentFilter"
                  value="my"
                  checked={filterMode === "my"}
                  onChange={() => setFilterMode("my")}
                />
                <span>Only My Course Students</span>
              </label>
            </div>

            {filterMode === "my" && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-600">
                  Course:
                </label>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  value={selectedMyCourseId}
                  onChange={(e) => setSelectedMyCourseId(e.target.value)}
                >
                  {allCourses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.classTitle}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <div
              key={student._id}
              className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                student.deactivated
                  ? "border-rose-200 bg-rose-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-lg font-semibold text-slate-800">
                    {student.name}
                  </h5>
                  <p className="text-sm text-slate-600">Phone: {student.phone}</p>
                </div>

                <button
                  onClick={() => openPopup(student._id, student.name)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100"
                >
                  Status
                </button>
              </div>

              <div className="mb-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    student.deactivated
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {student.deactivated ? "Deactivated" : "Active"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                  onClick={() => openForm(student._id)}
                >
                  Enroll
                </button>

                <button
                  className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                  onClick={() => openDeletePopup(student._id)}
                >
                  Delete
                </button>

                <button
                  onClick={() => handleEditClick(student)}
                  className="rounded-lg bg-blue-500 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleViewClick(student)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredStudents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No students found for this search.
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <ClipLoader color="#FFA500" loading={loading} css={override} size={70} />
        </div>
      )}

      {isFormOpen &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay app-modal-overlay--top app-modal-overlay--scroll">
            <div className="app-modal-card app-modal-card-md max-h-[90vh] overflow-y-auto">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                Enroll Student
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="courses"
                    className="block text-sm font-medium text-slate-700"
                  >
                    My Courses
                  </label>
                  <select
                    className="mt-1 w-full"
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    value={selectedCourseId}
                    required
                  >
                    <option value="">Select Course</option>
                    {allCourses.map((course, index) => (
                      <option key={index} value={course._id}>
                        {course.classTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="totalFee"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Total Fee
                  </label>
                  <input
                    type="text"
                    id="totalFee"
                    name="totalFee"
                    value={formData.totalFee}
                    onChange={handleChange}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="feeMonth"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Fee Month
                  </label>
                  <select
                    className="mt-1 w-full"
                    onChange={(e) =>
                      setFormData({ ...formData, feeMonth: e.target.value })
                    }
                    value={formData.feeMonth}
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Payment Status
                  </label>
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-700">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="paid"
                        value="pending"
                        checked={formData.paid === "pending"}
                        onChange={() => handlePaidChange("pending")}
                      />
                      <span>Pending</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="paid"
                        value="yes"
                        checked={formData.paid === "yes"}
                        onChange={() => handlePaidChange("yes")}
                      />
                      <span>Yes</span>
                    </label>
                  </div>
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="amountPaid"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Amount Paid
                  </label>
                  <input
                    type="text"
                    id="amountPaid"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    className="mt-1"
                    required={formData.paid === "yes"}
                    disabled={formData.paid === "pending"}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg bg-slate-500 px-4 py-2 text-white hover:bg-slate-600"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {showPopup &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay app-modal-overlay--top app-modal-overlay--scroll">
            <div className="app-modal-card app-modal-card-md max-h-[90vh] overflow-y-auto">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                {stuname}
              </h2>
              <form onSubmit={detailsctiveaccount}>
                <div className="mb-4">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full"
                  >
                    <option>Select Status</option>
                    <option value="false">Activate Account</option>
                    <option value="true">Deactivate Account</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="rounded-lg bg-slate-500 px-4 py-2 text-white hover:bg-slate-600"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {popupMessage &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay app-modal-overlay--top">
            <div className="app-modal-card app-modal-card-sm">
              <p className="text-lg font-semibold text-slate-800">
                {popupMessage}
              </p>
              <button
                onClick={() => setPopupMessage("")}
                className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}

      {showDeletePopup &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay app-modal-overlay--top app-modal-overlay--scroll">
            <div className="app-modal-card app-modal-card-md text-center">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowDeletePopup(false)}
                  className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                <svg
                  className="h-10 w-10 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="mb-2 text-xl font-bold text-slate-800">
                Confirm Deletion
              </h3>
              <p className="mb-8 text-slate-600">
                Are you sure you want to delete this student record? This action
                cannot be undone.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={deleteStudent}
                  className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeletePopup(false)}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {showEditModal && selectedStudent && (
        <div className="app-modal-overlay">
          <div className="app-modal-card app-modal-card-md relative p-4">
            <TeacherEditStudent
              studentData={selectedStudent}
              closingModel={closeEditModal}
            />
          </div>
        </div>
      )}

      {showViewModal && viewStudent && (
        <div className="app-modal-overlay app-modal-overlay--top app-modal-overlay--scroll">
          <div className="app-modal-card app-modal-card-md relative">
            <button
              className="absolute right-4 top-4 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
              onClick={closeViewModal}
            >
              Close
            </button>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-800">
                {viewStudent.name}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="font-semibold">{viewStudent.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                  <p className="font-semibold">{viewStudent.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Username</p>
                  <p className="font-semibold">{viewStudent.userName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Grade</p>
                  <p className="font-semibold">{viewStudent.grade || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Branch</p>
                  <p className="font-semibold">{viewStudent.branch || "Main"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                  <p className="font-semibold">
                    {viewStudent.deactivated ? "Deactivated" : "Active"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">DOB</p>
                  <p className="font-semibold">
                    {viewStudent.dob
                      ? new Date(viewStudent.dob).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Joined</p>
                  <p className="font-semibold">
                    {viewStudent.createdAt
                      ? new Date(viewStudent.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherAllStudents;
