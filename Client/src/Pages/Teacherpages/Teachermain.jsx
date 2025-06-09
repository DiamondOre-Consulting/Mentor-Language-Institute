import React, { useEffect, useState } from "react";
import TeacherSidebar from "../../Component/TeachersComponents/TeacherSidebar";
import TeacherDashboard from "../../Component/TeachersComponents/TeacherDashboard";
import axios from "axios";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";

const Teachermain = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  // console.log(token )

  if (!token) {
    navigate("/login"); // Redirect to login page if not authenticated
    return;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds
      // console.log(tokenExpiration)

      if (tokenExpiration && tokenExpiration < Date.now()) {
        // Token expired, remove from local storage and redirect to login page
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [decodedToken]);

  useEffect(() => {
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
          "https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/my-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response?.status == 200) {
          setTeacherData(response?.data);
        }
      } catch (error) {
        console.error("");
      }
    };

    fetchTeacherData();
  }, []);

  return (
    <>
      <TeacherSidebar />
      <div className="admin-content">
        <TeacherDashboard teacherData={teacherData} />
      </div>
    </>
  );
};

export default Teachermain;
