import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import userimage from "..//..//assets/userimg.jpg";

const AllTeachers = () => {
  const navigate = useNavigate();
  const { get, del } = useApi();
  const [allTeachers, setAllTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [popup, setPopUp] = useState(false);
  const [teacherid, setTeacherId] = useState("");

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fetchAllTeachers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/admin-login");
        return;
      }

      const response = await get({
        url: "/admin-confi/all-teachers",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status === 200) {
        setAllTeachers(response.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  useEffect(() => {
    fetchAllTeachers();
  }, [navigate]);

  useEffect(() => {
    document.body.style.overflow = popup ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [popup]);

  const filteredTeachers = allTeachers.filter((teacher) => {
    const query = searchQuery.toLowerCase();
    return (
      teacher?.name?.toLowerCase().includes(query) ||
      teacher?.phone?.toLowerCase().includes(query)
    );
  });

  const totalAssignedCourses = allTeachers.reduce(
    (sum, teacher) => sum + Number(teacher?.assignedCourseCount || 0),
    0
  );

  const openPopup = (id) => {
    setTeacherId(id);
    setPopUp(true);
  };

  const closePopup = () => {
    setPopUp(false);
  };

  const deleteTeacher = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const deleteCourse = await del({
        url: `/admin-confi/delete-teacher/${teacherid}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (deleteCourse.status === 200) {
        setAllTeachers((prevTeachers) =>
          prevTeachers.filter((teacher) => teacher._id !== teacherid)
        );
        setPopUp(false);
      }
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-100 via-white to-amber-100 p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-orange-300/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-amber-300/20 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                Faculty Directory
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
                All Teachers
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                View full teacher profiles, course assignments, and quick actions in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-orange-100 bg-white/80 p-3 text-center shadow-sm sm:gap-3">
              <div className="rounded-xl bg-orange-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Teachers</p>
                <p className="mt-1 text-xl font-bold text-slate-800">{allTeachers.length}</p>
              </div>
              <div className="rounded-xl bg-slate-100 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Assignments</p>
                <p className="mt-1 text-xl font-bold text-slate-800">{totalAssignedCourses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                placeholder="Search by name or phone..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                style={{ paddingLeft: "3rem" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              Showing {filteredTeachers.length} of {allTeachers.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-200/30 blur-2xl transition group-hover:bg-orange-300/40" />
              <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-amber-200/25 blur-2xl" />

              <div className="relative flex items-start gap-4">
                <div className="relative">
                  <img
                    src={userimage}
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-orange-100"
                    alt="Teacher"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {teacher?.role || "Teacher"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-slate-800">{teacher?.name}</p>
                  <p className="truncate text-sm text-slate-500">{teacher?.phone}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                    <span className="rounded-full bg-orange-50 px-2 py-1 text-orange-700">
                      Joined: {formatDate(teacher?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-600">Courses</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {Number(teacher?.assignedCourseCount || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">DOB</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatDate(teacher?.dob)}
                  </p>
                </div>
              </div>

              <div className="relative mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assigned Courses
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(teacher?.assignedCourses || []).slice(0, 3).map((course) => (
                    <span
                      key={course?._id}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {course?.classTitle}
                    </span>
                  ))}
                  {(teacher?.assignedCourses || []).length === 0 && (
                    <span className="text-xs text-slate-500">No courses assigned.</span>
                  )}
                  {(teacher?.assignedCourses || []).length > 3 && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      +{(teacher?.assignedCourses || []).length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="relative mt-5 flex flex-wrap items-center gap-2">
                <Link
                  to={`/admin-dashboard/allteacher/${teacher?._id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-500"
                >
                  View Profile
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </Link>
                <Link
                  to={`/admin-dashboard/teacher-edit/${teacher?._id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-600"
                >
                  Edit
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </Link>
                <button
                  className="ml-auto rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                  onClick={() => openPopup(teacher?._id)}
                  aria-label="Delete teacher"
                >
                  <svg
                    className="h-4 w-4"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No teachers found for this search.
          </div>
        )}
      </div>

      {popup &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay">
            <div className="app-modal-card app-modal-card-md text-center">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={closePopup}
                  type="button"
                  className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <svg className="mx-auto h-16 w-16 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mb-6 mt-4 text-lg font-semibold text-slate-700">
                Are you sure you want to delete this teacher?
              </h3>
              <div className="flex justify-center gap-2">
                <button
                  onClick={deleteTeacher}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={closePopup}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
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

export default AllTeachers;
