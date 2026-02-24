import React, { useEffect } from 'react'
import Courseheropage from '../../Component/Studentcomponents/Eachcourses/Courseheropage'
import Coursedet from '../../Component/Studentcomponents/Eachcourses/Coursedet'
import { useNavigate } from 'react-router-dom'


const StudentEachcourses = () => {

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/student-login");
    }
  }, [navigate])


  return (
    <>
      <Courseheropage />
      <Coursedet />

    </>
  )
}

export default StudentEachcourses
