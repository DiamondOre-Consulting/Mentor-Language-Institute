import React, { useEffect } from 'react'
import Courseheropage from '../../Component/Studentcomponents/Eachcourses/Courseheropage'
import Coursedet from '../../Component/Studentcomponents/Eachcourses/Coursedet'
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'
import StuFooter from '../../Component/Studentcomponents/Studashboard/StuFooter'


const StudentEachcourses = () => {

  const navigate = useNavigate();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/student-login");
    return;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // No token found, redirect to login page
      navigate("/student-login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds

      if (tokenExpiration && tokenExpiration < Date.now()) {
        // Token expired, remove from local storage and redirect to login page
        localStorage.removeItem("token");
        navigate("/student-login");
      }
    }
  }, [decodedToken])


  return (
    <>
      <Courseheropage />
      <Coursedet />
      <StuFooter />

    </>
  )
}

export default StudentEachcourses