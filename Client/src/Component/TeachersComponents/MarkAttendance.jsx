import React, { useState, useEffect } from "react";
import axios from "axios";

const MarkAttendance = () => {
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grade, setGrade] = useState("");
  const [inputHours, setInputHours] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  const token = localStorage.getItem("token");
const [teacherData , setTeacherData] = useState(null)
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date?.getDate()).padStart(2, "0");
    const month = String(date?.getMonth() + 1).padStart(2, "0");
    const year = date?.getFullYear();
    return `${day}-${month}-${year}`;
  };


     const fetchTeacherProfile = async()=>{
            const token = localStorage.getItem("token");

      try {
        const response = await axios.get('https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/my-profile' , 
            {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        )
        console.log(response)
        setTeacherData(response?.data)
      } catch (error) {
        console.log(error)
      }
     }


  
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/my-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response?.data)
      setStudentList(response.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
    fetchTeacherProfile()
  }, []);


  console.log(1)

  const markOrEditAttendance = async () => {
    try {
      setMarking(true);

      const attendanceDetail = selectedStudent.attendanceDetail?.[0];
      console.log(attendanceDetail)
      const todayRecord = attendanceDetail?.detailAttendance?.find(
        (a) => a.classDate === formatDate(selectedDate)
      );
console.log(todayRecord)

      const attendanceEntryId = todayRecord?._id;


      // If record exists → edit
      if (todayRecord && attendanceEntryId) {
        await axios.put(
          `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/edit-attendance/${selectedStudent._id}/${attendanceEntryId}`,
          {
            classDate: formatDate(selectedDate),
            numberOfClassesTaken: inputHours,
            grade,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
      const response =  await axios.post(
          `https://mentor-backend-rbac6.ondigitalocean.app/api/teachers/mark-attendance/${selectedStudent._id}/${teacherData?.myClasses[0]}`,
          {
            classDate: formatDate(selectedDate),
            numberOfClassesTaken: inputHours,
            grade,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("res" , response)
      }

console.log(selectedStudent._id , inputHours , selectedDate , grade)
    const res=  await fetchStudentData();
    console.log(res)
    } catch (error) {
      console.error("Failed to mark/edit attendance:", error);
    } finally {
      setSelectedStudent(null);
      setInputHours("");
      setGrade("");
      setMarking(false);
    }
  };


  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl mt-10 sm:text-3xl font-semibold mb-6">
        Mark Attendance
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <label className="text-lg font-medium">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-1 rounded-md w-full sm:w-auto"
        />
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
              <th className="px-4 py-3">Number Of Hours</th>
              <th className="px-4 py-3">Grade</th>

              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
     <tbody>
  {loading ? (
    <tr>
      <td colSpan="5" className="py-4 text-center">
        Loading...
      </td>
    </tr>
  ) : studentList.length > 0 ? (
    studentList.map((student) => {
      // Step 1: Filter attendanceDetail entries that belong to teacher's class
      const relevantAttendances = student.attendanceDetail?.filter((entry) =>
        teacherData?.myClasses?.includes(entry.classId)
      ) || [];

      console.log("relavent",relevantAttendances)
      // Step 2: From relevant entries, get detailAttendance for selected date
      const todayRecords = relevantAttendances.flatMap((entry) =>
        entry.detailAttendance?.filter(
          (record) => record.classDate === formatDate(selectedDate)
        ) || []
      );

      // Step 3: Render one row per todayRecord (if exists), else one row with "No Record"
      if (todayRecords.length > 0) {
        return todayRecords.map((record, index) => (
          <tr key={`${student._id}-${index}`} className="bg-white border-b hover:bg-orange-50">
            <td className="px-4 py-3">{student.name}</td>
            <td className="px-4 py-3">{student.phone}</td>
            <td className="px-4 py-3">{record.numberOfClassesTaken} hours</td>
            <td className="px-4 py-3">{record.grade || "N/A"}</td>
            <td className="px-4 py-3">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm"
                onClick={() => {
                  setSelectedStudent(student);
                  setInputHours(record.numberOfClassesTaken);
                  setGrade(record.grade || "");
                }}
              >
                Edit Attendance
              </button>
            </td>
          </tr>
        ));
      } else {
        // No attendance for this student in teacher's classes on selected date
        return (
          <tr key={student._id} className="bg-white border-b hover:bg-orange-50">
            <td className="px-4 py-3">{student.name}</td>
            <td className="px-4 py-3">{student.phone}</td>
            <td className="px-4 py-3 text-gray-400">No record</td>
            <td className="px-4 py-3 text-gray-400">No record</td>
            <td className="px-4 py-3">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm"
                onClick={() => {
                  setSelectedStudent(student);
                  setInputHours("");
                  setGrade("");
                }}
              >
                Mark Attendance
              </button>
            </td>
          </tr>
        );
      }
    })
  ) : (
    <tr>
      <td colSpan="5" className="py-4 text-center text-gray-500">
        No students found
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              Mark Hours for {selectedStudent.name}
            </h3>
            <input
              type="number"
              placeholder="Enter number of hours"
              className="w-full border px-4 py-2 rounded-md mb-4"
              value={inputHours}
              onChange={(e) => setInputHours(e.target.value)}
            />

            {/* <input
              type="text"
              placeholder="Enter Grade"
              className="w-full border px-4 py-2 rounded-md mb-4"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            /> */}
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
                onClick={() => {
                  setSelectedStudent(null);
                  setInputHours("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
                onClick={markOrEditAttendance}
                disabled={marking}
              >
                {marking ? "Marking..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
