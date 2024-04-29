import React, { useEffect } from 'react'
import Courseheropage from '../../Component/Studentcomponents/Eachcourses/Courseheropage'
import Coursedet from '../../Component/Studentcomponents/Eachcourses/Coursedet'
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'

const StudentEachcourses = () => {
  
  const navigate = useNavigate();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // No token found, redirect to login page
      navigate("/login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds

      if (tokenExpiration && tokenExpiration < Date.now()) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [decodedToken])

  return (
    <>
        <Courseheropage/>
        <Coursedet/>
    
    </>
  )
}

export default StudentEachcourses