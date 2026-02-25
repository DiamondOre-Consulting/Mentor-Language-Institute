import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import TeacherHome from "./TeacherHome";
import TeacherProfile from "./TeacherProfile";
import TeacherAllStudentEachCourse from "./TeacherAllStudentEachCourse";
import { useNavigate } from "react-router-dom";
import Error from "..//Studentcomponents/Stuauth/Error";
import TeacherAddStudent from "./TeacherAddStudent";
import TeacherAllStudents from "./TeacherAllStudents";
import TeacherEditStudent from "./TeacherEditStudent";
import MarkAttendance from "./MarkAttendance";

const TeacherDashboard = ({ teacherData }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  // console.log("teacherdata in teacherdashboard", teacherData)

  return (
    <>
      <div className="p-0 pt-16 sm:ml-72 sm:pt-6">
        <div className="flex-grow ">
          <Routes>
            <Route index element={<TeacherHome teacherData={teacherData} />} />
            <Route path="mark-attendance" element={<MarkAttendance />} />
            <Route
              path="myaccount"
              element={<TeacherProfile teacherData={teacherData} />}
            />
            <Route
              path="all-students"
              element={<TeacherAllStudents teacherData={teacherData} />}
            />
            <Route
              path="each-student/:id"
              element={<TeacherEditStudent teacherData={teacherData} />}
            />
            <Route path="add-student" element={<TeacherAddStudent />} />
            <Route
              path="allstudents/:selectedClassId"
              element={<TeacherAllStudentEachCourse />}
            />
            {/* Add more routes for additional components */}
            <Route path="*" element={<Error />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;
