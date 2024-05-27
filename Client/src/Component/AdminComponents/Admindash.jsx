import React, { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Home from '..//AdminComponents//Home'
import Register from '..//AdminComponents/Register'
import logo from '..//..//assets/logo.png'
import Allstudents from './Allstudents'
import AllTeachers from './AllTeachers'
import Allcourses from './Allcourses'
import EachTeacher from './EachTeacher'
import EachStu from './EachStu'
import Message from './Message'
import Eachcourse from './Eachcourse'
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'
import EachTeacherClassStudentAttendance from './EachTeacherClassStudentAttendance'
import Error from '..//Studentcomponents/Stuauth/Error'
import ChatAdmin from '../../Pages/Adminpages/ChatAdmin'



const Admindash = () => {
    
    const navigate = useNavigate();

    const { decodedToken } = useJwt(localStorage.getItem("token"));
    const token = localStorage.getItem("token");
    // console.log("this is admin dashboar token",token)
    if (!token) {
      navigate("/login"); // Redirect to login page if not authenticated
      return;
    }
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      // console.log(token)
      if (!token) {
        // No token found, redirect to login page
        navigate("/login");
      } else {
        const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds
  
        if (tokenExpiration && tokenExpiration < Date.now()) {
          // Token expired, remove from local storage and redirect to login page
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    }, [decodedToken])

    return (
        <>

            <div className="p-2 md:p-4 sm:ml-64">
                <div className="py-4 md:px-4 md:py-4 md:border-2 border-gray-200 border-dashed rounded-lg ">
                    <div className="flex-grow md:px-4 md:py-4 px-2">
                        <Routes>
                          <Route path='/'>
                            <Route index element={<Home />} />
                            <Route path='/allstudents' element={<Allstudents />} />
                            <Route path='/allteachers' element={<AllTeachers />} />
                            <Route path='/allteacher/:id' element={<EachTeacher/>}/>
                            <Route path='/:id/:selectedClassId' element={<EachTeacherClassStudentAttendance/>}/>
                            <Route path='/allstudents/:id' element={<EachStu/>}/>
                            <Route path='/messages' element={<Message/>}/>
                            <Route path='/allcourses' element={<Allcourses />} />
                            <Route path='/allcourses/:id' element={<Eachcourse/>}/>
                            <Route path='/register' element={<Register />} />
                            <Route path= '/admin/chat/*' element={<ChatAdmin/>}/>
                            <Route path='*' element={<Error/>}/>
                            </Route>
                            {/* <Route path='/Chat' element={<Chat/>}/> */}
                            {/* Add more routes for additional components */}
                        </Routes>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Admindash