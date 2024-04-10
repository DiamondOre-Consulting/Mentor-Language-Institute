import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Parentlog from './Component/Parentcomponent/parentHomeComponent/Parentlog'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Mainhome from './Pages/parentpages/parenthomepage/Mainhome'
import Eachcourse from './Pages/parentpages/stueachcourses/Eachcourse'
import Admin from './Pages/Adminpages/Admin'
import Register from './Component/AdminComponents/Register'
import Home from './Component/AdminComponents/Home'
import Allparents from './Component/AdminComponents/Allparents'



function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
      <Route path='/' element={<Parentlog/>}/>
      <Route path='/parent/home' element={<Mainhome/>}/>
      <Route path ='/each/course' element={<Eachcourse/>}/>
      <Route path ='/admin-dashboard' element={<Admin/>}/>
      <Route path ='/all-parents' element={<Allparents/>}/>
      </Routes>
    </BrowserRouter>
    
    </>
  )
}

export default App
