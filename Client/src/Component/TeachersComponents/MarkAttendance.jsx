import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../../api/useApi";

const MarkAttendance = () => {
  const { get, post } = useApi();
  const token = localStorage.getItem("token");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [presentMap, setPresentMap] = useState({});
  const [classHours, setClassHours] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [classMode, setClassMode] = useState("offline");
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchClasses = async () => {
    try {
      const response = await get({
        url: "/teachers/my-classes",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      if (response.status === 200) {
        setClasses(response.data);
        if (!selectedClassId && response.data.length > 0) {
          setSelectedClassId(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchClassStudents = async (classId) => {
    const response = await get({
      url: `/teachers/class/all-students/${classId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).unwrap();
    return response.status === 200 ? response.data : [];
  };

  const fetchClassDetails = async (classId) => {
    const response = await get({
      url: `/teachers/my-classes/${classId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).unwrap();
    return response.status === 200 ? response.data : null;
  };

  const fetchAttendanceForDate = async (classId, dateValue) => {
    const response = await get({
      url: `/teachers/attendance/${classId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        attendanceDate: formatDate(dateValue),
        mode: classMode,
      },
    }).unwrap();
    return response.status === 200 ? response.data : [];
  };

  const loadAttendanceSheet = async () => {
    if (!selectedClassId) return;
    try {
      setLoading(true);
      const [students, classDetails, attendanceRows] = await Promise.all([
        fetchClassStudents(selectedClassId),
        fetchClassDetails(selectedClassId),
        fetchAttendanceForDate(selectedClassId, selectedDate),
      ]);

      setStudentList(students);

      const session = classDetails?.dailyClasses?.find(
        (d) =>
          d.classDate === formatDate(selectedDate) &&
          (d.mode || "offline") === classMode
      );
      if (session?.numberOfClasses) {
        setClassHours(session.numberOfClasses);
      }

      const presentSet = new Set(
        (attendanceRows || [])
          .filter((row) => {
            const detail = row.detailAttendance?.find(
              (d) =>
                d.classDate === formatDate(selectedDate) &&
                (d.mode || "offline") === classMode
            );
            return detail && Number(detail.numberOfClassesTaken || 0) > 0;
          })
          .map((row) => String(row.studentId))
      );

      if (presentSet.size === 0 && students.length > 0) {
        const defaultMap = {};
        students.forEach((student) => {
          defaultMap[student._id] = true;
        });
        setPresentMap(defaultMap);
      } else {
        const nextMap = {};
        students.forEach((student) => {
          nextMap[student._id] = presentSet.has(String(student._id));
        });
        setPresentMap(nextMap);
      }
    } catch (error) {
      console.error("Failed to load attendance sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    loadAttendanceSheet();
  }, [selectedClassId, selectedDate, classMode]);

  const setAllPresence = (isPresent) => {
    const updated = {};
    studentList.forEach((student) => {
      updated[student._id] = isPresent;
    });
    setPresentMap(updated);
  };

  const submitAttendance = async () => {
    if (!classHours && classHours !== 0) {
      alert("Please enter class hours.");
      return;
    }
    try {
      setMarking(true);
      const presentStudentIds = Object.entries(presentMap)
        .filter(([, value]) => value)
        .map(([key]) => key);

      await post({
        url: `/teachers/attendance/bulk/${selectedClassId}`,
        data: {
          classDate: formatDate(selectedDate),
          numberOfClasses: classHours,
          presentStudentIds,
          mode: classMode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      await loadAttendanceSheet();
    } catch (error) {
      console.error("Failed to submit attendance:", error);
    } finally {
      setMarking(false);
    }
  };

  const presentCount = useMemo(
    () => studentList.filter((s) => presentMap[s._id]).length,
    [studentList, presentMap]
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl mt-10 sm:text-3xl font-semibold mb-6">
        Mark Attendance
      </h2>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-lg font-medium">Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-auto"
          >
            {classes.length === 0 && <option value="">No classes</option>}
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.classTitle}
              </option>
            ))}
          </select>

          <label className="text-lg font-medium">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-1 rounded-md w-full sm:w-auto"
          />

          <label className="text-lg font-medium">Mode:</label>
          <select
            value={classMode}
            onChange={(e) => setClassMode(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-auto"
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>

          <label className="text-lg font-medium">Hours:</label>
          <input
            type="number"
            min="0"
            value={classHours}
            onChange={(e) => setClassHours(e.target.value)}
            className="border px-3 py-1 rounded-md w-full sm:w-28"
            placeholder="0"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-md text-sm"
            onClick={() => setAllPresence(true)}
          >
            Mark All Present
          </button>
          <button
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-md text-sm"
            onClick={() => setAllPresence(false)}
          >
            Mark All Absent
          </button>
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-md text-sm"
            onClick={submitAttendance}
            disabled={marking || !selectedClassId}
          >
            {marking ? "Saving..." : "Save Attendance"}
          </button>
          <span className="text-sm text-gray-600">
            Present: {presentCount}/{studentList.length}
          </span>
        </div>

        <p className="text-sm text-gray-600">
          Marking for{" "}
          <span className="font-semibold">{formatDate(selectedDate)}</span>
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm text-center text-gray-700 min-w-[640px]">
          <thead className="text-xs uppercase bg-orange-500 text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Present</th>
              <th className="px-4 py-3">Hours</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : studentList.length > 0 ? (
              studentList.map((student) => (
                <tr
                  key={student._id}
                  className="bg-white border-b hover:bg-orange-50"
                >
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.phone}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!presentMap[student._id]}
                      onChange={(e) =>
                        setPresentMap((prev) => ({
                          ...prev,
                          [student._id]: e.target.checked,
                        }))
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    {presentMap[student._id] ? classHours || 0 : 0} hours
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarkAttendance;

