import React, { useEffect, useState } from 'react'
import TeacherSidebar from '../../Component/TeachersComponents/TeacherSidebar'
import TeacherDashboard from '../../Component/TeachersComponents/TeacherDashboard'
import axios from "axios";
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom';

const Teachermain = () => {
  const navigate = useNavigate();
  const [teacherData , setTeacherData] =useState("");
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  console.log(token )

  useEffect(()=>{
    const fetchTeacherData = async () => {
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
          "http://192.168.29.235:7000/api/teachers/my-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status == 200) {
          // console.log("teacherdata",response.data);
          const all = response.data;
          setTeacherData(response.data);
          console.log("teachermain data",teacherData)
     
        } else {
          console.log(response.data);
          
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        
      }
    };

    fetchTeacherData();
  },[])



  useEffect(() => {
    console.log("this is a token of teacher", token);
    if (!token) {
        navigate("/login"); // Redirect to login page if not authenticated
    } else {
        const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds

        if (tokenExpiration && tokenExpiration < Date.now()) {
            
            localStorage.removeItem("token");
            navigate("/login");
        }
    }
}, [decodedToken, navigate, token]);

  return (
    <>
       <TeacherSidebar/>
      <div className="admin-content">
        <TeacherDashboard teacherData={teacherData}/>
      </div>
    </>
  )
}

export default Teachermain