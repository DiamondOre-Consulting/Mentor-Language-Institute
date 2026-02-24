import React, { useEffect, useState } from "react";
import TeacherSidebar from "../../Component/TeachersComponents/TeacherSidebar";
import TeacherDashboard from "../../Component/TeachersComponents/TeacherDashboard";
import { useApi } from "../../api/useApi";
import { useNavigate } from "react-router-dom";

const Teachermain = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState();
  const { get } = useApi();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

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
        const response = await get({
          url: "/teachers/my-profile",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

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
    <div className="teacher-shell">
      <TeacherSidebar />
      <div className="admin-content">
        <TeacherDashboard teacherData={teacherData} />
      </div>
    </div>
  );
};

export default Teachermain;

