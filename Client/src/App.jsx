import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Parentlog from './Component/Parentcomponent/parentHomeComponent/Parentlog'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Mainhome from './Pages/parentpages/parenthomepage/Mainhome'
import Eachcourse from './Pages/parentpages/stueachcourses/Eachcourse'


function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
      <Route path='' element={<Parentlog/>}/>
      <Route path='/parent/home' element={<Mainhome/>}/>
      <Route path ='/each/course' element={<Eachcourse/>}/>
      </Routes>
    </BrowserRouter>
    
    </>
  )
}

export default App
