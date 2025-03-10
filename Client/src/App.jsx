import './App.css'
import Parentsignup from './Component/Studentcomponents/Stuauth/Parentsignup'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Admin from './Pages/Adminpages/Admin'

import Home from './Component/AdminComponents/Home'
import Login from './Component/TeacherAdminAuthentication/Login'
import Maindash from './Pages/Studentpages/Maindash'
import StudentEachcourses from './Pages/Studentpages/StudentEachcourses'
import { Sidebar } from 'flowbite-react'
import Teachermain from './Pages/Teacherpages/Teachermain'
import StudentLogin from './Component/Studentcomponents/Stuauth/StudentLogin'
import Error from './Component/Studentcomponents/Stuauth/Error'
// import Chat from './Pages/Chat'

import ChatStudent from './Pages/Studentpages/ChatStudent'
import ChatTeacher from './Pages/Teacherpages/ChatTeacher'
import UserVerify from './Component/Auth/ProtectedRoute'





function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/'>
            <Route index element={<Parentsignup />} />
            <Route path='/login' element={<Login />} />
            <Route path='/student-login' element={<StudentLogin />} />
            {/* <Route path='/student-chat' element={<StudentChat/>}/> */}
            <Route element={<UserVerify routeName="students" />}>
              <Route path='/main-dashboard' element={<Maindash />} />
              <Route path='/student-each-course/:id' element={<StudentEachcourses />} />
              <Route path='/student/chat/*' element={<ChatStudent />} />
            </Route>
            <Route element={<UserVerify routeName="admin-confi" />}>
              <Route path='/admin-dashboard/*' element={<Admin />} />
            </Route>

            <Route element={<UserVerify routeName="teachers" />}>
              <Route path='/teacher-dashboard/*' element={<Teachermain />} />
            </Route>

            {/* <Route path='/teacher/chat/*' element={<ChatTeacher/>}/> */}
            <Route path='*' element={<Error />} />
          </Route>

        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
