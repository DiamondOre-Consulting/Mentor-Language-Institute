import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import EmptyState from "../Common/EmptyState";
import { CardSkeletonGrid } from "../Common/ListSkeleton";
import { getToastVariant } from "../../utils/toastVariant";
import { validateAmountPaid, validateNumber, validateRequired } from "../../utils/validators";

const Allstudents = () => {
  const navigate = useNavigate();
  const { get, put, del } = useApi();
  const [allStudents, setAllStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [status, setStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [setuId, setStuId] = useState(null);
  const [stuname, setStuName] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showDeleteAllPopup, setShowDeleteAllPopup] = useState(false);
  const [gradeFilter, setGradeFilter] = useState("");
  const toastVariant = getToastVariant(popupMessage);

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
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);

  const [formData, setFormData] = useState({
    totalFee: "",
    feeMonth: "",
    feeYear: String(currentYear),
    paid: "pending",
    amountPaid: "0",
  });

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setIsFetching(true);
      try {
        const [studentsResponse, coursesResponse] = await Promise.all([
          get({ url: "/admin-confi/all-students" }).unwrap(),
          get({ url: "/admin-confi/all-classes" }).unwrap(),
        ]);

        if (!active) return;
        if (studentsResponse.status === 200) {
          setAllStudents(studentsResponse.data);
        }
        if (coursesResponse.status === 200) {
          setAllCourses(coursesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        if (active) setIsFetching(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [get]);

  useEffect(() => {
    const hasOpenModal =
      isFormOpen ||
      showPopup ||
      !!popupMessage ||
      isBusy ||
      showDeletePopup ||
      showDeleteAllPopup;
    document.body.style.overflow = hasOpenModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFormOpen, showPopup, popupMessage, isBusy, showDeletePopup, showDeleteAllPopup]);

  const normalizeGrade = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const gradeOptions = useMemo(() => {
    const unique = new Map();
    allStudents.forEach((student) => {
      const raw = String(student?.grade || "").trim();
      if (!raw) return;
      const key = normalizeGrade(raw);
      if (!unique.has(key)) unique.set(key, raw);
    });
    const entries = Array.from(unique.values());
    return entries.sort((a, b) => {
      const anum = parseInt(String(a).match(/\d+/)?.[0] || "999", 10);
      const bnum = parseInt(String(b).match(/\d+/)?.[0] || "999", 10);
      if (anum !== bnum) return anum - bnum;
      return String(a).localeCompare(String(b));
    });
  }, [allStudents]);

  const filteredStudents = allStudents.filter((student) => {
    const matchesName = student.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter
      ? normalizeGrade(student?.grade) === normalizeGrade(gradeFilter)
      : true;
    return matchesName && matchesGrade;
  });

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const openForm = (studentId) => {
    const student = allStudents.find((item) => item._id === studentId) || null;
    setSelectedStudent(student);
    setSelectedStudentId(studentId);
    setIsFormOpen(true);
  };

  const openPopup = (studentId, studentName) => {
    setStuId(studentId);
    setStuName(studentName);
    setShowPopup(true);
  };

  const updateFeeField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "totalFee") {
      setFormErrors((prev) => ({
        ...prev,
        totalFee: validateNumber(value, { min: 0, label: "Total fee" }),
        amountPaid:
          formData.paid === "yes"
            ? validateAmountPaid(formData.amountPaid, value, { required: true })
            : "",
      }));
    }
    if (name === "feeMonth") {
      setFormErrors((prev) => ({
        ...prev,
        feeMonth: validateRequired(value, "Fee month"),
      }));
    }
    if (name === "feeYear") {
      setFormErrors((prev) => ({
        ...prev,
        feeYear: validateNumber(value, {
          min: 2000,
          max: 2100,
          integer: true,
          label: "Fee year",
        }),
      }));
    }
    if (name === "amountPaid") {
      setFormErrors((prev) => ({
        ...prev,
        amountPaid:
          formData.paid === "yes"
            ? validateAmountPaid(value, formData.totalFee, { required: true })
            : "",
      }));
    }
  };

  const handlePaidChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      paid: value,
      amountPaid: value === "pending" ? "0" : prev.amountPaid,
    }));
    setFormErrors((prev) => ({
      ...prev,
      amountPaid:
        value === "yes"
          ? validateAmountPaid(formData.amountPaid, formData.totalFee, { required: true })
          : "",
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
    const nextErrors = {
      totalFee: validateNumber(formData.totalFee, { min: 0, label: "Total fee" }),
      feeMonth: validateRequired(formData.feeMonth, "Fee month"),
      feeYear: validateNumber(formData.feeYear, {
        min: 2000,
        max: 2100,
        integer: true,
        label: "Fee year",
      }),
      amountPaid:
        formData.paid === "yes"
          ? validateAmountPaid(formData.amountPaid, formData.totalFee, { required: true })
          : "",
    };
    setFormErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    try {
      setIsBusy(true);
      const { totalFee, feeMonth, feeYear, paid, amountPaid } = formData;
      const monthNumber = monthNameToNumber[feeMonth];
      const isPaid = paid === "yes";
      const normalizedAmountPaid = isPaid ? Number(amountPaid) : 0;
      const effectivePaid =
        isPaid &&
        Number(totalFee) > 0 &&
        normalizedAmountPaid >= Number(totalFee);
      const paymentStatus = effectivePaid
        ? "paid"
        : normalizedAmountPaid > 0
          ? "partial"
          : "pending";

      const response = await put({
        url: `/admin-confi/enroll-student/${selectedCourseId}/${selectedStudentId}`,
        data: {
          totalFee: Number(totalFee),
          feeMonth: monthNumber,
          feeYear: Number(feeYear),
          paid: isPaid,
          amountPaid: normalizedAmountPaid,
        },
      }).unwrap();

      if (response.status === 200) {
        if (paymentStatus === "paid") {
          setPopupMessage("Student enrolled and invoice sent.");
        } else if (paymentStatus === "partial") {
          setPopupMessage("Student enrolled with partial payment recorded.");
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
      setIsBusy(false);
    }
  };

  const closeForm = () => {
    setSelectedStudentId("");
    setSelectedCourseId("");
    setSelectedStudent(null);
      setFormData({
        totalFee: "",
        feeMonth: "",
        feeYear: String(currentYear),
        paid: "pending",
        amountPaid: "0",
      });
      setFormErrors({});
      setIsFormOpen(false);
  };

  const filteredCoursesForStudent = allCourses.filter((course) => {
    if (!selectedStudent?.grade || !course?.grade) return false;
    return normalizeGrade(course.grade) === normalizeGrade(selectedStudent.grade);
  });

  const detailsctiveaccount = async (e) => {
    e.preventDefault();

    try {
      setIsBusy(true);
      const deactiveResponse = await put({
        url: `/admin-confi/deactivate-account/${setuId}`,
        data: { status },
      }).unwrap();

      if (deactiveResponse.status === 201) {
        setAllStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === setuId
              ? { ...student, deactivated: status === "true" }
              : student
          )
        );
        setShowPopup(false);
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
    } finally {
      setIsBusy(false);
    }
  };

  const deleteStudent = async () => {
    try {
      setIsBusy(true);
      const response = await del({
        url: `/admin-confi/delete-student/${deleteId}`,
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Student Deleted Successfully");
        setAllStudents(allStudents.filter((s) => s._id !== deleteId));
        setShowDeletePopup(false);
      }
    } catch (error) {
      console.log("");
    } finally {
      setIsBusy(false);
    }
  };

  const openDeletePopup = (id) => {
    setDeleteId(id);
    setShowDeletePopup(true);
  };

  const openDeleteAllPopup = () => {
    setShowDeleteAllPopup(true);
  };

  const closeDeleteAllPopup = () => {
    setShowDeleteAllPopup(false);
  };

  const deleteAllStudents = async () => {
    try {
      setIsBusy(true);
      const response = await del({
        url: "/admin-confi/delete-all-students?confirm=true",
      }).unwrap();

      if (response.status === 200) {
        setAllStudents([]);
        setPopupMessage(response.data?.message || "All students deleted.");
        setShowDeleteAllPopup(false);
      }
    } catch (error) {
      setPopupMessage("Failed to delete all students.");
    } finally {
      setIsBusy(false);
    }
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

            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full">
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
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:max-w-[200px]"
              >
                <option value="">All grades</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={openDeleteAllPopup}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-100"
              >
                Delete All
              </button>
            </div>

          </div>
        </div>

        {isFetching ? (
          <CardSkeletonGrid count={6} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${student.deactivated
                    ? "border-rose-200 bg-rose-50"
                    : "border-slate-200 bg-white"
                    }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-lg font-semibold text-slate-800">{student.name}</h5>
                      <p className="text-sm text-slate-600">Phone: {student.phone}</p>
                      <p className="text-sm text-slate-600">Grade: {student.grade || "N/A"}</p>
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
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${student.deactivated
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

                    <Link
                      to={`/admin-dashboard/student/${student._id}`}
                      className="rounded-lg bg-blue-500 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-600"
                    >
                      Edit
                    </Link>

                    <Link
                      to={`/admin-dashboard/allstudents/${student._id}`}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {!isFetching && filteredStudents.length === 0 && (
              <EmptyState
                title={
                  searchQuery || gradeFilter
                    ? "No matching students"
                    : "No students yet"
                }
                description={
                  searchQuery || gradeFilter
                    ? "Try adjusting your search or clear the filter."
                    : "Start by registering a student to see them here."
                }
                actionLabel="Register Student"
                onAction={() => navigate("/admin-dashboard/register")}
              />
            )}
          </>
        )}
      </div>

      {isFormOpen && ReactDOM.createPortal(
        <div className="app-modal-overlay app-modal-overlay--top app-modal-overlay--scroll">
          <div className="app-modal-card app-modal-card-md max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Enroll Student</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="courses" className="block text-sm font-medium text-slate-700">
                  Courses (Grade {selectedStudent?.grade || "N/A"})
                </label>
                <select
                  className="mt-1 w-full"
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  value={selectedCourseId}
                  required
                >
                  <option value="">Select Course</option>
                  {filteredCoursesForStudent.length === 0 ? (
                    <option value="" disabled>
                      No courses available for this grade
                    </option>
                  ) : (
                    filteredCoursesForStudent.map((course, index) => (
                      <option key={index} value={course._id}>
                        {course.classTitle}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="totalFee" className="block text-sm font-medium text-slate-700">
                  Total Fee
                </label>
                <input
                  type="text"
                  id="totalFee"
                  name="totalFee"
                  value={formData.totalFee}
                  onChange={(e) => updateFeeField("totalFee", e.target.value)}
                  className="mt-1"
                  required
                  inputMode="decimal"
                />
                {formErrors.totalFee && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.totalFee}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="feeMonth" className="block text-sm font-medium text-slate-700">
                  Fee Month
                </label>
                <select
                  className="mt-1 w-full"
                  onChange={(e) => updateFeeField("feeMonth", e.target.value)}
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
                {formErrors.feeMonth && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.feeMonth}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="feeYear" className="block text-sm font-medium text-slate-700">
                  Fee Year
                </label>
                <select
                  className="mt-1 w-full"
                  onChange={(e) => updateFeeField("feeYear", e.target.value)}
                  value={formData.feeYear}
                  required
                >
                  {yearOptions.map((yearValue) => (
                    <option key={yearValue} value={yearValue}>
                      {yearValue}
                    </option>
                  ))}
                </select>
                {formErrors.feeYear && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.feeYear}</p>
                )}
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
                <label htmlFor="amountPaid" className="block text-sm font-medium text-slate-700">
                  Amount Paid
                </label>
                <input
                  type="text"
                  id="amountPaid"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={(e) => updateFeeField("amountPaid", e.target.value)}
                  className="mt-1"
                  required={formData.paid === "yes"}
                  disabled={formData.paid === "pending"}
                  inputMode="decimal"
                />
                {formErrors.amountPaid && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.amountPaid}</p>
                )}
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
                  disabled={isBusy}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isBusy ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showPopup && ReactDOM.createPortal(
        <div className="app-modal-overlay app-modal-overlay--top app-modal-overlay--scroll">
          <div className="app-modal-card app-modal-card-md max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">{stuname}</h2>
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
                  disabled={isBusy}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isBusy ? "Saving..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {popupMessage && ReactDOM.createPortal(
        <div className="app-toast-overlay">
          <div className={`app-toast-card app-toast-${toastVariant} relative`}>
            <button
              type="button"
              className="app-toast-close"
              onClick={() => setPopupMessage("")}
              aria-label="Close notification"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <p className="pt-2 text-sm font-semibold">{popupMessage}</p>
          </div>
        </div>,
        document.body
      )}

      {showDeletePopup && ReactDOM.createPortal(
        <div className="app-modal-overlay app-modal-overlay--top app-modal-overlay--scroll">
          <div className="app-modal-card app-modal-card-md text-center">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <svg className="h-10 w-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="mb-2 text-xl font-bold text-slate-800">Confirm Deletion</h3>
            <p className="mb-8 text-slate-600">
              Are you sure you want to delete this student record? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={deleteStudent}
                disabled={isBusy}
                className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isBusy ? "Deleting..." : "Yes, Delete"}
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

      {showDeleteAllPopup && ReactDOM.createPortal(
        <div className="app-modal-overlay">
          <div className="app-modal-card app-modal-card-md text-center">
            <div className="mb-4 flex justify-end">
              <button
                onClick={closeDeleteAllPopup}
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
              Delete All Students
            </h3>
            <p className="mb-8 text-slate-600">
              This will permanently remove every student and all related records.
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={deleteAllStudents}
                disabled={isBusy}
                className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isBusy ? "Deleting..." : "Yes, Delete All"}
              </button>
              <button
                onClick={closeDeleteAllPopup}
                className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Allstudents;


