import React, { useEffect } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import TeacherHome from "./TeacherHome";
import TeacherProfile from "./TeacherProfile";
import TeacherAllStudentEachCourse from "./TeacherAllStudentEachCourse";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";
import ChatTeacher from "../../Pages/Teacherpages/ChatTeacher";
import Error from "..//Studentcomponents/Stuauth/Error";
import TeacherAddStudent from "./TeacherAddStudent";

const TeacherDashboard = ({ teacherData }) => {
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds
      // console.log(tokenExpiration)

      if (tokenExpiration && tokenExpiration < Date.now()) {
        // Token expired, remove from local storage and redirect to login page
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [decodedToken]);

  // console.log("teacherdata in teacherdashboard", teacherData)

  return (
    <>
      <div className="p-0  sm:ml-64">
        <div className="flex-grow ">
          <Routes>
            <Route path="/">
              <Route
                index
                element={<TeacherHome teacherData={teacherData} />}
              />
              <Route path="/teacher/chat/*" element={<ChatTeacher />} />
              <Route
                path="/myaccount"
                element={<TeacherProfile teacherData={teacherData} />}
              />
              <Route path="/add-student" element={<TeacherAddStudent />} />
              <Route
                path="/allstudents/:selectedClassId"
                element={<TeacherAllStudentEachCourse />}
              />
              {/* <Route path='/allstudents/:selectedClassId' element={<TeacherAllStudents/>}/> */}
              {/* <Route path='/attendance' element={<UpdateAttendence/>}/> */}
              {/* Add more routes for additional components */}
              <Route path="*" element={<Error />} />
            </Route>
          </Routes>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;
