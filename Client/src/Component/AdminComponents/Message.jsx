import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { useApi } from "../../api/useApi";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { getToastVariant } from "../../utils/toastVariant";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getMentorNames = (course) =>
  (course?.teachers || [])
    .map((teacher) => teacher?.teacherId?.name)
    .filter(Boolean)
    .join(", ");

const getShortId = (value) => {
  if (!value) return "N/A";
  const str = String(value);
  if (str.length <= 10) return str;
  return `${str.slice(0, 6)}...${str.slice(-4)}`;
};

const Message = () => {
  const { get, put } = useApi();
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    totalFee: "",
    feeMonth: "",
    paid: "pending",
    amountPaid: "0",
  });
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await get({
          url: "/admin-confi/all-students",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (response.status === 200) {
          const students = response.data || [];
          const studentById = students.reduce((acc, student) => {
            acc[student._id] = student;
            return acc;
          }, {});

          const appliedCourses = students.flatMap((student) =>
            (student.appliedClasses || []).map((classId) => ({
              studentId: student._id,
              classId,
            }))
          );

          if (appliedCourses.length === 0) {
            setRequests([]);
            return;
          }

          const courseResults = await Promise.allSettled(
            appliedCourses.map(async ({ studentId, classId }) => {
              const classDetails = await get({
                url: `/admin-confi/all-classes/${classId}`,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }).unwrap();
              return {
                studentId,
                classId,
                course: classDetails.data,
              };
            })
          );

          const nextRequests = courseResults
            .filter(
              (result) =>
                result.status === "fulfilled" &&
                result.value?.course &&
                studentById[result.value.studentId]
            )
            .map((result) => {
              const { studentId, classId, course } = result.value;
              const student = studentById[studentId];
              return {
                id: `${studentId}-${classId}`,
                studentId,
                classId,
                student,
                course,
                mentors: getMentorNames(course),
              };
            });

          setRequests(nextRequests);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, []);

  useEffect(() => {
    const hasOpenModal = isFormOpen || !!popupMessage || loading;
    document.body.style.overflow = hasOpenModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFormOpen, popupMessage, loading]);

  const filteredRequests = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return requests;

    return requests.filter((request) => {
      const student = request.student || {};
      const course = request.course || {};
      return [
        student.name,
        student.email,
        student.phone,
        student.userName,
        student.grade,
        student.branch,
        course.classTitle,
        course.grade,
        course.branch,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(trimmed));
    });
  }, [requests, query]);

  const openForm = (studentId, classId) => {
    setSelectedStudentId(studentId);
    setSelectedClassId(classId);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedStudentId("");
    setSelectedClassId("");
    setFormData({
      totalFee: "",
      feeMonth: "",
      paid: "pending",
      amountPaid: "0",
    });
    setIsFormOpen(false);
    setPopupMessage("");
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
        console.error("No token found");
        return;
      }

      const { totalFee, feeMonth, paid, amountPaid } = formData;
      const monthNumber = monthNameToNumber[feeMonth];
      const isPaid = paid === "yes";
      const normalizedAmountPaid = isPaid ? Number(amountPaid) : 0;

      const response = await put({
        url: `/admin-confi/enroll-student/${selectedClassId}/${selectedStudentId}`,
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
        setRequests((prev) =>
          prev.filter(
            (request) =>
              !(
                request.studentId === selectedStudentId &&
                request.classId === selectedClassId
              )
          )
        );
        setFormData({
          totalFee: "",
          feeMonth: "",
          paid: "pending",
          amountPaid: "0",
        });
        setSelectedStudentId("");
        setSelectedClassId("");
        setIsFormOpen(false);
      } else if (response.status === 409) {
        setPopupMessage("Student already Enrolled!");
        setIsFormOpen(false);
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409) {
          setPopupMessage("Student already Enrolled!");
          setIsFormOpen(false);
        } else {
          setPopupMessage("Unable to enroll student right now.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">
              Enrollment Requests
            </h1>
            <p className="text-sm text-slate-500">
              Review student applications and enroll them into courses.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <label className="text-xs font-semibold text-slate-500">
              Search
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student or course..."
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>{filteredRequests.length} pending request(s)</span>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-orange-600 hover:text-orange-700"
            >
              Clear search
            </button>
          )}
        </div>

        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-8 text-center text-sm text-slate-600">
            No enrollment requests right now.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-orange-100/70 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {request.course?.classTitle}
                      </h3>
                      <Badge variant="secondary">Pending</Badge>
                      <span className="text-xs text-slate-500">
                        Course ID: {getShortId(request.classId)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Grade: {request.course?.grade || "N/A"} · Hours:{" "}
                      {request.course?.totalHours || "TBA"} · Branch:{" "}
                      {request.course?.branch || "Main"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Mentors: {request.mentors || "Not assigned"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Added on {formatDate(request.course?.createdAt)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="self-start"
                    onClick={() =>
                      openForm(request.studentId, request.classId)
                    }
                  >
                    Enroll Now
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Student
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {request.student?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Username: {request.student?.userName || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Student ID: {getShortId(request.studentId)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Contact
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {request.student?.email || "No email"}
                    </p>
                    <p className="text-sm text-slate-700">
                      {request.student?.phone || "No phone"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Profile
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Grade: {request.student?.grade || "Not set"}
                    </p>
                    <p className="text-sm text-slate-700">
                      Branch: {request.student?.branch || "Main"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Joined {formatDate(request.student?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {popupMessage && (
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
        </div>
      )}
    </>
  );
};

export default Message;
