import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { getToastVariant } from "../../utils/toastVariant";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const gradeOptions = ["6th", "7th", "8th", "9th", "10th", "11th", "12th"];

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

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { get, put, post, del } = useApi();
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [allTeachers, setAllTeachers] = useState([]);
  const toastVariant = getToastVariant(popupMessage);

  const [formValues, setFormValues] = useState({
    classTitle: "",
    totalHours: "",
    grade: "",
  });
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    teacherId: "",
    offlineCommissionRate: "",
    onlineCommissionRate: "",
  });

  const token = localStorage.getItem("token");

  const resolvedGrade = useMemo(
    () => formValues.grade || deriveGradeFromText(formValues.classTitle),
    [formValues.grade, formValues.classTitle]
  );

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await get({
          url: `/admin-confi/all-classes/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        if (response.status === 200) {
          const course = response.data;
          const resolvedGrade = toGradeLabel(course?.grade) || deriveGradeFromText(course?.classTitle) || "";
          setFormValues({
            classTitle: course?.classTitle || "",
            totalHours: course?.totalHours ?? 0,
            grade: resolvedGrade,
          });
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await get({
          url: "/admin-confi/all-teachers",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status === 200) {
          setAllTeachers(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    const fetchAssignments = async () => {
      try {
        const response = await get({
          url: `/admin-confi/class-teachers/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status === 200) {
          const normalized = (response.data || []).map((assignment) => ({
            ...assignment,
            offlineCommissionRate:
              assignment?.offlineCommissionRate ??
              assignment?.commissionRate ??
              0,
            onlineCommissionRate:
              assignment?.onlineCommissionRate ??
              assignment?.commissionRate ??
              0,
          }));
          setAssignments(normalized);
        }
      } catch (error) {
        console.error("Error fetching class teachers:", error);
      }
    };

    if (!token) {
      navigate("/login");
      return;
    }

    fetchCourse();
    fetchTeachers();
    fetchAssignments();
  }, [id, token, navigate]);

  useEffect(() => {
    const hasOpenModal = loading || !!popupMessage;
    document.body.style.overflow = hasOpenModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading, popupMessage]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPopupMessage(null);

    const gradeValue = formValues.grade || resolvedGrade;
    if (!gradeValue) {
      setLoading(false);
      setPopupMessage("Please select a grade for this course.");
      return;
    }

    try {
      const response = await put({
        url: `/admin-confi/course-edit/${id}`,
        data: {
          classTitle: formValues.classTitle,
          totalHours: Number(formValues.totalHours),
          grade: gradeValue,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      if (response.status === 200) {
        setPopupMessage("Course updated successfully");
      } else {
        setPopupMessage("Error updating course");
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400 || status === 404) {
        setPopupMessage(error?.response?.data?.message || "Error updating course");
      } else {
        setPopupMessage("Error updating course");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (assignmentId, field, value) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment._id === assignmentId
          ? { ...assignment, [field]: value }
          : assignment
      )
    );
  };

  const refreshAssignments = async () => {
    try {
      const response = await get({
        url: `/admin-confi/class-teachers/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status === 200) {
        const normalized = (response.data || []).map((assignment) => ({
          ...assignment,
          offlineCommissionRate:
            assignment?.offlineCommissionRate ??
            assignment?.commissionRate ??
            0,
          onlineCommissionRate:
            assignment?.onlineCommissionRate ??
            assignment?.commissionRate ??
            0,
        }));
        setAssignments(normalized);
      }
    } catch (error) {
      console.error("Error fetching class teachers:", error);
    }
  };

  const handleAddAssignment = async () => {
    if (!newAssignment.teacherId) {
      setPopupMessage("Please select a teacher.");
      return;
    }
    setLoading(true);
    try {
      const response = await post({
        url: `/admin-confi/class-teachers/${id}`,
        data: {
          teacherId: newAssignment.teacherId,
          offlineCommissionRate: Number(newAssignment.offlineCommissionRate || 0),
          onlineCommissionRate: Number(newAssignment.onlineCommissionRate || 0),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status === 200) {
        await refreshAssignments();
        setNewAssignment({
          teacherId: "",
          offlineCommissionRate: "",
          onlineCommissionRate: "",
        });
      }
    } catch (error) {
      setPopupMessage(error?.response?.data?.message || "Error assigning teacher.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignment = async (assignmentId, offlineRate, onlineRate) => {
    setLoading(true);
    try {
      const response = await put({
        url: `/admin-confi/class-teachers/${assignmentId}`,
        data: {
          offlineCommissionRate: Number(offlineRate || 0),
          onlineCommissionRate: Number(onlineRate || 0),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status === 200) {
        await refreshAssignments();
      }
    } catch (error) {
      setPopupMessage(error?.response?.data?.message || "Error updating assignment.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    setLoading(true);
    try {
      const response = await del({
        url: `/admin-confi/class-teachers/${assignmentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status === 200) {
        await refreshAssignments();
      }
    } catch (error) {
      setPopupMessage(error?.response?.data?.message || "Error removing assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <ClipLoader color={"#FFA500"} loading={loading} css={override} size={70} />
        </div>
      )}

      <section className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Course</h1>
            <p className="mt-1 text-sm text-slate-500">Update course details without changing functionality.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back
          </button>
        </div>

        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleCourseEdit}>
          <div className="sm:col-span-2">
            <label htmlFor="classTitle" className="mb-1 block text-sm font-medium text-slate-700">
              Course Title
            </label>
            <input
              type="text"
              name="classTitle"
              id="classTitle"
              value={formValues.classTitle}
              onChange={handleInputChange}
              placeholder="Enter course title"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
              required
            />
          </div>

          <div>
            <label htmlFor="grade" className="mb-1 block text-sm font-medium text-slate-700">
              Grade
            </label>
            <select
              id="grade"
              name="grade"
              value={formValues.grade}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
              required
            >
              <option value="">Select Grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            {resolvedGrade && !formValues.grade && (
              <p className="mt-1 text-xs text-slate-500">Detected from title: {resolvedGrade}</p>
            )}
          </div>

          <div>
            <label htmlFor="totalHours" className="mb-1 block text-sm font-medium text-slate-700">
              Total Hours
            </label>
            <input
              type="number"
              name="totalHours"
              id="totalHours"
              value={formValues.totalHours}
              onChange={handleInputChange}
              placeholder="Enter total hours"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
              required
            />
          </div>

          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-700">Assigned Teachers</h2>
            <div className="mt-3 space-y-3">
              {assignments.length === 0 && (
                <p className="text-xs text-slate-500">No teachers assigned yet.</p>
              )}
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex-1 text-sm text-slate-700">
                    {assignment?.teacherId?.name || "Unknown"} ({assignment?.teacherId?.phone || "N/A"})
                  </div>
                  <input
                    type="number"
                    value={assignment.offlineCommissionRate}
                    onChange={(e) =>
                      handleAssignmentChange(
                        assignment._id,
                        "offlineCommissionRate",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 sm:w-40"
                    placeholder="Offline rate"
                  />
                  <input
                    type="number"
                    value={assignment.onlineCommissionRate}
                    onChange={(e) =>
                      handleAssignmentChange(
                        assignment._id,
                        "onlineCommissionRate",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 sm:w-40"
                    placeholder="Online rate"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateAssignment(
                        assignment._id,
                        assignment.offlineCommissionRate,
                        assignment.onlineCommissionRate
                      )
                    }
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAssignment(assignment._id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              <select
                value={newAssignment.teacherId}
                onChange={(e) =>
                  setNewAssignment((prev) => ({ ...prev, teacherId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="">Select Teacher</option>
                {allTeachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.UniqueCode ? `${teacher.UniqueCode}` : `${teacher.name}`}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={newAssignment.offlineCommissionRate}
                onChange={(e) =>
                  setNewAssignment((prev) => ({
                    ...prev,
                    offlineCommissionRate: e.target.value,
                  }))
                }
                placeholder="Offline rate"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              />
              <input
                type="number"
                value={newAssignment.onlineCommissionRate}
                onChange={(e) =>
                  setNewAssignment((prev) => ({
                    ...prev,
                    onlineCommissionRate: e.target.value,
                  }))
                }
                placeholder="Online rate"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              />
              <button
                type="button"
                onClick={handleAddAssignment}
                className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
              >
                Add Teacher
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <button className="w-full rounded-lg bg-orange-500 p-2.5 text-sm font-semibold text-white hover:bg-orange-600">
              Save Changes
            </button>
          </div>
        </form>
      </section>

      {popupMessage && (
        <div className="app-toast-overlay">
          <div className={`app-toast-card app-toast-${toastVariant} relative`}>
            <button
              type="button"
              className="app-toast-close"
              onClick={() => setPopupMessage(null)}
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

export default EditCourse;
