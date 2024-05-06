import React, { useEffect, useState } from 'react'
import StudentNav from '../../Component/Studentcomponents/Studashboard/StudentNav'
import Studenthero from '../../Component/Studentcomponents/Studashboard/Studenthero'
import EnrolledCourses from '../../Component/Studentcomponents/Studashboard/EnrolledCourses'
import LanguageCourses from '../../Component/Studentcomponents/Studashboard/LanguageCourses'
import Classes from '../../Component/Studentcomponents/Studashboard/Classes'
import StuFooter from '../../Component/Studentcomponents/Studashboard/StuFooter'
import axios from "axios";
import SpecialCourses from '../../Component/Studentcomponents/Studashboard/SpecialCourses'
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'

const Maindash = () => {

  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          // Token not found in local storage, handle the error or redirect to the login page
          console.error("No token found");
          navigate("/login");
          return;
        }

        // Fetch associates data from the backend
        const response = await axios.get(
          "http://localhost:7000/api/students/my-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status == 200) {
          // console.log(response.data.name);
          const stu = response.data;
          console.log("students details", stu)
          setStudentData(stu);

        } else {
          console.log(response.data);

        }
      } catch (error) {
        console.error("Error fetching student data:", error);

      }
    };

    fetchStudentData();
  }, [])


  const navigate = useNavigate();

  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login"); // Redirect to login page if not authenticated
    return;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    // console.log(token)
    if (!token) {
      // No token found, redirect to login page
      navigate("/login");
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
      <StudentNav />
      <Studenthero naming={studentData} />
      <EnrolledCourses />
      <LanguageCourses />
      <SpecialCourses />
      <Classes />
      <StuFooter />


    </>
  )
}

export default Maindash