import './App.css'
import { useEffect } from 'react'
import Parentsignup from './Component/Studentcomponents/Stuauth/Parentsignup'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Admin from './Pages/Adminpages/Admin'
import Login from './Component/TeacherAdminAuthentication/Login'
import Maindash from './Pages/Studentpages/Maindash'
import StudentEachcourses from './Pages/Studentpages/StudentEachcourses'
import Teachermain from './Pages/Teacherpages/Teachermain'
import Error from './Component/Studentcomponents/Stuauth/Error'
import UserVerify from './Component/Auth/ProtectedRoute'
import SiteFooter from './Component/Common/SiteFooter'
import { initScrollReveal } from './utils/scrollReveal'

function App() {
  useEffect(() => {
    const handleSubmit = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }

    document.addEventListener('submit', handleSubmit)

    // Initialize site-wide scroll-reveal animations
    const cleanup = initScrollReveal()

    return () => {
      document.removeEventListener('submit', handleSubmit)
      if (cleanup) cleanup()
    }
  }, [])

  return (
    <div className="premium-edu">
      <BrowserRouter>
        <Routes>
          <Route path='/'>
            <Route index element={<Parentsignup />} />
            <Route path='/login' element={<Login />} />
            <Route path='/student-login' element={<Login defaultTab="student" />} />
            {/* <Route path='/student-chat' element={<StudentChat/>}/> */}
            <Route element={<UserVerify routeName="students" />}>
              <Route path='/main-dashboard' element={<Maindash />} />
              <Route path='/student-each-course/:id' element={<StudentEachcourses />} />
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
        <SiteFooter />
      </BrowserRouter>
    </div>
  )
}

export default App
