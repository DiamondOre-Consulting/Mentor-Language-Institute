import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Parentsignup from './Component/Studentcomponents/Stuauth/Parentsignup'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Admin from './Pages/Adminpages/Admin'

import Home from './Component/AdminComponents/Home'
import Login from './Component/Studentcomponents/Stuauth/Login'
import Maindash from './Pages/Studentpages/Maindash'
import StudentEachcourses from './Pages/Studentpages/StudentEachcourses'
import { Sidebar } from 'flowbite-react'
import Teachermain from './Pages/Teacherpages/Teachermain'





function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Parentsignup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/main-dashboard' element={<Maindash />} />
          <Route path='/student-each-course' element={<StudentEachcourses/>} />
          <Route path='/admin-dashboard/*' element={<Admin/>}/>
          <Route path='/teacher-dashboard/*' element={<Teachermain/>}/>
         
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
