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
import Eachcourse from './Eachcourse'


const Admindash = () => {


    return (
        <>

            <div className="p-2 md:p-4 sm:ml-64">
                <div className="py-4 md:px-4 md:py-4 md:border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
                    <div className="flex-grow md:px-4 md:py-4 px-2">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/" element={<Home />} />
                            <Route path='/allstudents' element={<Allstudents />} />
                            <Route path='/allteachers' element={<AllTeachers />} />
                            <Route path='/allteacher/:id' element={<EachTeacher/>}/>
                            <Route path='/allstudents/:id' element={<EachStu/>}/>
                            <Route path='/messages' element={<Message/>}/>
                            <Route path='/allcourses' element={<Allcourses />} />
                            <Route path='/allcourses/:id' element={<Eachcourse/>}/>
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