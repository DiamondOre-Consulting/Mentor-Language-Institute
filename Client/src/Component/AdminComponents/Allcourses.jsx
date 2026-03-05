import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import EmptyState from "../Common/EmptyState";
import { CardSkeletonGrid } from "../Common/ListSkeleton";

const Allcourses = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [popup, setPopUp] = useState(false);
  const [showDeleteAllPopup, setShowDeleteAllPopup] = useState(false);
  const [courseid, setCourseId] = useState("");
  const navigate = useNavigate();
  const { get, del } = useApi();

  const fetchAllcourses = async () => {
    try {
      setIsFetching(true);
      const response = await get({
        url: "/admin-confi/all-classes",
      }).unwrap();

      if (response.status === 200) {
        setAllCourses(response.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAllcourses();
  }, [get]);

  useEffect(() => {
    const hasOpenModal = popup || isBusy || showDeleteAllPopup;
    document.body.style.overflow = hasOpenModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [popup, isBusy, showDeleteAllPopup]);

  const normalizeGradeValue = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value).trim().toLowerCase();
    if (!str) return "";
    const match = str.match(/\d+/);
    if (!match) return str;
    const num = parseInt(match[0], 10);
    if (!Number.isFinite(num)) return "";
    return String(num);
  };

  const toGradeLabel = (value) => {
    const normalized = normalizeGradeValue(value);
    if (!normalized) return "";
    const num = Number(normalized);
    if (!Number.isFinite(num)) {
      return String(value).trim();
    }
    const mod100 = num % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${num}th`;
    switch (num % 10) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  };

  const deriveGradeFromText = (text) => {
    if (!text) return "";
    const str = String(text).toLowerCase();
    const match = str.match(/\b(6|7|8|9|10|11|12)(?:st|nd|rd|th)?\b/);
    if (!match) return "";
    return toGradeLabel(match[1]);
  };

  const resolveCourseGradeLabel = (course) =>
    toGradeLabel(course?.grade) || deriveGradeFromText(course?.classTitle);

  const filteredCourses = useMemo(() => {
    const gradeValue = normalizeGradeValue(gradeFilter);
    const searchValue = searchQuery.toLowerCase();
    return allCourses.filter((course) => {
      const matchesSearch = course.classTitle
        .toLowerCase()
        .includes(searchValue);
      if (!matchesSearch) return false;
      if (!gradeValue) return true;
      const courseGrade = normalizeGradeValue(resolveCourseGradeLabel(course));
      return courseGrade && courseGrade === gradeValue;
    });
  }, [allCourses, searchQuery, gradeFilter]);

  const totalStudentsAcrossCourses = useMemo(
    () => allCourses.reduce((sum, c) => sum + (c?.enrolledStudents?.length || 0), 0),
    [allCourses]
  );

  const openPopup = (id) => {
    setCourseId(id);
    setPopUp(true);
  };

  const closePopup = () => {
    setPopUp(false);
  };

  const openDeleteAllPopup = () => {
    setShowDeleteAllPopup(true);
  };

  const closeDeleteAllPopup = () => {
    setShowDeleteAllPopup(false);
  };

  const deleteAllCourses = async () => {
    try {
      setIsBusy(true);
      const response = await del({
        url: "/admin-confi/delete-all-courses?confirm=true",
      }).unwrap();

      if (response.status === 200) {
        setAllCourses([]);
        setShowDeleteAllPopup(false);
      }
    } catch (error) {
      console.error("Error deleting all courses:", error);
    } finally {
      setIsBusy(false);
    }
  };

  const deleteCourse = async (e) => {
    e.preventDefault();

    try {
      setIsBusy(true);
      const deleteCourse = await del({
        url: `/admin-confi/delete-course/${courseid}`,
      }).unwrap();

      if (deleteCourse.status === 200) {
        setAllCourses((prevCourses) =>
          prevCourses.filter((course) => course._id !== courseid)
        );
        setPopUp(false);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-100 via-white to-amber-100 p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-orange-300/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-10 h-32 w-32 rounded-full bg-amber-300/25 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                Course Management
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">All Courses</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Manage your entire catalog with a cleaner, faster view of courses, durations, and enrolled student counts.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-orange-100 bg-white/80 p-3 text-center shadow-sm sm:gap-3">
              <div className="rounded-xl bg-orange-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Total Courses</p>
                <p className="mt-1 text-xl font-bold text-slate-800">{allCourses.length}</p>
              </div>
              <div className="rounded-xl bg-slate-100 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Enrollments</p>
                <p className="mt-1 text-xl font-bold text-slate-800">{totalStudentsAcrossCourses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 sm:max-w-2xl">
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
                  placeholder="Search course by title..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  style={{ paddingLeft: "3rem" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="w-full sm:max-w-[180px]">
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 px-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  aria-label="Filter by grade"
                >
                  <option value="">All Grades</option>
                  <option value="6th">6th</option>
                  <option value="7th">7th</option>
                  <option value="8th">8th</option>
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Showing {filteredCourses.length} of {allCourses.length}
              </span>
              <button
                type="button"
                onClick={openDeleteAllPopup}
                disabled={isBusy}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <article
                  key={course._id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                >
                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-orange-200/20 blur-xl transition group-hover:bg-orange-300/30" />

                  <div className="relative">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="line-clamp-2 text-lg font-bold leading-snug text-slate-800">{course?.classTitle}</h2>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Grade: {resolveCourseGradeLabel(course) || "N/A"}
                        </p>
                      </div>
                      <button
                        onClick={() => openPopup(course._id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 transition hover:bg-rose-100"
                        aria-label="Delete course"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <line x1="4" y1="7" x2="20" y2="7" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">Duration</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{course?.totalHours} hrs</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Enrolled</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{course.enrolledStudents.length} students</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link
                        to={`/admin-dashboard/allcourses/${course?._id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-500"
                      >
                        View Details
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m9 6 6 6-6 6" />
                        </svg>
                      </Link>
                      <Link
                        to={`/admin-dashboard/course-edit/${course?._id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-600"
                      >
                        Edit
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!isFetching && filteredCourses.length === 0 && (
              <EmptyState
                title={searchQuery || gradeFilter ? "No matching courses" : "No courses yet"}
                description={
                  searchQuery || gradeFilter
                    ? "Try adjusting filters or search terms."
                    : "Create your first course to start building the catalog."
                }
                actionLabel="Create Course"
                onAction={() => navigate("/admin-dashboard/register")}
              />
            )}
          </>
        )}
      </section>

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
              <h3 className="mb-6 mt-4 text-lg font-semibold text-slate-700">Are you sure you want to delete this course?</h3>

              <div className="flex justify-center gap-2">
                <button
                  onClick={deleteCourse}
                  disabled={isBusy}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isBusy ? "Deleting..." : "Yes, Delete"}
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

      {showDeleteAllPopup &&
        ReactDOM.createPortal(
          <div className="app-modal-overlay">
            <div className="app-modal-card app-modal-card-md text-center">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={closeDeleteAllPopup}
                  type="button"
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

              <svg className="mx-auto h-16 w-16 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mb-2 mt-4 text-lg font-semibold text-slate-700">
                Delete All Courses
              </h3>
              <p className="mb-6 text-sm text-slate-600">
                This will permanently remove every course and all related data.
                This action cannot be undone.
              </p>

              <div className="flex justify-center gap-2">
                <button
                  onClick={deleteAllCourses}
                  disabled={isBusy}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isBusy ? "Deleting..." : "Yes, Delete All"}
                </button>
                <button
                  onClick={closeDeleteAllPopup}
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

export default Allcourses;


