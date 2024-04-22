import React, { useEffect, useState } from 'react'
import StudentNav from '../../Component/Studentcomponents/Studashboard/StudentNav'
import Studenthero from '../../Component/Studentcomponents/Studashboard/Studenthero'
import EnrolledCourses from '../../Component/Studentcomponents/Studashboard/EnrolledCourses'
import LanguageCourses from '../../Component/Studentcomponents/Studashboard/LanguageCourses'
import Classes from '../../Component/Studentcomponents/Studashboard/Classes'
import StuFooter from '../../Component/Studentcomponents/Studashboard/StuFooter'
import axios from "axios";
import SpecialCourses from '../../Component/Studentcomponents/Studashboard/SpecialCourses'

const Maindash = () => {

  const [studentData , setStudentData] =useState(null);
  
  useEffect(()=>{
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
          console.log(response.data.name);
          setStudentData(response.data.name);
          
        } else {
          console.log(response.data);
          
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        
      }
    };

    fetchStudentData();
  },[])
  return (
    <>
        <StudentNav/>
        <Studenthero naming={studentData} />
        <EnrolledCourses/>
        <LanguageCourses/>
        <SpecialCourses/>
        <Classes/>
        <StuFooter/>
      
    
    </>
  )
}

export default Maindash