import React, { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import TeacherHome from './TeacherHome'
import TeacherMessage from './TeacherMessage'
import TeacherProfile from './TeacherProfile'

import TeacherAllStudents from './TeacherAllStudents'
import TeacherAllStudentEachCourse from './TeacherAllStudentEachCourse'
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'
import ChatTeacher from '../../Pages/Teacherpages/ChatTeacher'


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
      console.log(tokenExpiration)

      if (tokenExpiration && tokenExpiration < Date.now()) {
        // Token expired, remove from local storage and redirect to login page
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [decodedToken])

  
  console.log("teacherdata in teacherdashboard", teacherData)



  return (
    <>
      <div className="p-0 md:p-4 sm:ml-64">
        <div className="p-4 md:border-2 border-orange-100 border-dashed rounded-lg ">
          <div className="flex-grow p-4">
            <Routes>
              <Route path="/" element={<TeacherHome teacherData={teacherData} />} />
              <Route path='/message' element={<TeacherMessage teacherData={teacherData}/>} />
              <Route path='/teacher/chat/*' element={<ChatTeacher/>}/>
              <Route path='/myaccount' element={<TeacherProfile teacherData={teacherData} />} />
              <Route path='/allstudents/:selectedClassId' element={<TeacherAllStudentEachCourse />} />


              {/* <Route path='/allstudents/:selectedClassId' element={<TeacherAllStudents/>}/> */}
              {/* <Route path='/attendance' element={<UpdateAttendence/>}/> */}

              {/* Add more routes for additional components */}
            </Routes>
          </div>
        </div>
      </div>
    </>
  )
}

export default TeacherDashboard