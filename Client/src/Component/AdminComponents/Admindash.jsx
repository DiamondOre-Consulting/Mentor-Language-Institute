import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "../AdminComponents/Home";
import Register from "../AdminComponents/Register";
import Allstudents from "./Allstudents";
import AllTeachers from "./AllTeachers";
import Allcourses from "./Allcourses";
import EachTeacher from "./EachTeacher";
import EachStu from "./EachStu";
import Message from "./Message";
import Eachcourse from "./Eachcourse";
import EachTeacherClassStudentAttendance from "./EachTeacherClassStudentAttendance";
import Error from "../Studentcomponents/Stuauth/Error";
import ChatAdmin from "../../Pages/Adminpages/ChatAdmin";
import EditStudent from "./EditStudent";
import DownloadAttendanceReport from "./DownloadAttendanceReport";
import AllAdmin from "./AllAdmin";
import EditTeacher from "./EditTeacher";
import EditCourse from "./EditCourse";
import PendingPayments from "./PendingPayments";
import PendingCommissions from "./PendingCommissions";

const Admindash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="admin-theme min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-white pb-6 pt-16 sm:ml-72 sm:pt-6">
      <div className="mx-2 rounded-2xl border border-orange-100/70 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:mx-4 sm:p-5">
        <Routes>
          <Route index element={<Home />} />
          <Route path="allstudents" element={<Allstudents />} />
          <Route path="allteachers" element={<AllTeachers />} />
          <Route path="allteacher/:id" element={<EachTeacher />} />
          <Route
            path=":id/:selectedClassId"
            element={<EachTeacherClassStudentAttendance />}
          />
          <Route path="allstudents/:id" element={<EachStu />} />
          <Route path="student/:id" element={<EditStudent />} />
          <Route path="teacher-edit/:id" element={<EditTeacher />} />
          <Route path="course-edit/:id" element={<EditCourse />} />
          <Route path="messages" element={<Message />} />
          <Route path="allcourses" element={<Allcourses />} />
          <Route path="allcourses/:id" element={<Eachcourse />} />
          <Route path="register" element={<Register />} />
          <Route path="admin/chat/*" element={<ChatAdmin />} />
          <Route path="all-admin" element={<AllAdmin />} />
          <Route path="pending-payments" element={<PendingPayments />} />
          <Route path="pending-commissions" element={<PendingCommissions />} />
          <Route path="attendance-report" element={<DownloadAttendanceReport />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admindash;
