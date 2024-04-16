import React, { useState } from 'react'
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


const Admindash = () => {




    return (
        <>

            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
                    <div className="flex-grow p-4">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path='/allstudents' element={<Allstudents />} />
                            <Route path='/allteachers' element={<AllTeachers />} />
                            <Route path='/allteacher/eachteacher' element={<EachTeacher/>}/>
                            <Route path='/allstudents/eachstudent' element={<EachStu/>}/>
                            <Route path='/messages' element={<Message/>}/>
                            <Route path='/allcourses' element={<Allcourses />} />
                            <Route path='/register' element={<Register />} />
                            {/* Add more routes for additional components */}
                        </Routes>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Admindash