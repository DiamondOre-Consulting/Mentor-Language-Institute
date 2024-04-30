import React from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import TeacherHome from './TeacherHome'
import TeacherMessage from './TeacherMessage'
import TeacherProfile from './TeacherProfile'
import UpdateAttendence from './UpdateAttendence'
import TeacherAllStudents from './TeacherAllStudents'

const TeacherDashboard = ({teacherData}) => {
  console.log("teacherdata in teacherdashboard",teacherData)
  return (
    <>
        <div className="p-0 md:p-4 sm:ml-64">
                <div className="p-4 md:border-2 border-orange-100 border-dashed rounded-lg dark:border-gray-700">
                    <div className="flex-grow p-4">
                        <Routes>
                         <Route path="/" element={<TeacherHome teacherData={teacherData}  />} />
                            <Route path="/" element={<TeacherHome teacherData={teacherData}/>} /> 
                            <Route path='/message' element={<TeacherMessage/>}/>
                            <Route path='/myaccount' element={<TeacherProfile teacherData={teacherData}/>}/>
                            <Route path='/allstudents/:selectedClassId' element={<TeacherAllStudents/>}/>
          
                            <Route path='/attendence' element={<UpdateAttendence/>}/>
                         
                            {/* Add more routes for additional components */}
                        </Routes>
                    </div>
                </div>
            </div>
    </>
  )
}

export default TeacherDashboard