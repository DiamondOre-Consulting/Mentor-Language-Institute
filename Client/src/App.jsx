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
import StudentLogin from './Component/Studentcomponents/Stuauth/StudentLogin'
import Error from './Component/Studentcomponents/Stuauth/Error'
// import Chat from './Pages/Chat'
import StudentChat from './Pages/Studentpages/StudentChat'
import ChatStudent from './Pages/Studentpages/ChatStudent'
import ChatTeacher from './Pages/Teacherpages/ChatTeacher'





function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Parentsignup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/student-login' element={<StudentLogin/>}/>
          <Route path='/student-chat' element={<StudentChat/>}/>
          <Route path='/main-dashboard' element={<Maindash />} />
          <Route path='/student-each-course/:id' element={<StudentEachcourses/>} />
          <Route path='/admin-dashboard/*' element={<Admin/>}/>
          <Route path='/teacher-dashboard/*' element={<Teachermain/>}/>
          <Route path='/student/chat/*' element={<ChatStudent/>}/>
          <Route path='/teacher/chat/*' element={<ChatTeacher/>}/>
          <Route path='/*' element={<Error/>}/>
         
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
