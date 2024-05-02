import React, { useEffect } from 'react'
import Courseheropage from '../../Component/Studentcomponents/Eachcourses/Courseheropage'
import Coursedet from '../../Component/Studentcomponents/Eachcourses/Coursedet'
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'

const StudentEachcourses = () => {
  
  const navigate = useNavigate();
 

  return (
    <>
        <Courseheropage/>
        <Coursedet/>
    
    </>
  )
}

export default StudentEachcourses