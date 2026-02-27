import React, { useCallback, useEffect, useState } from "react";
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

  const fetchTeacherData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }

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
  }, [get, navigate]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  return (
    <div className="teacher-shell">
      <TeacherSidebar />
      <div className="admin-content">
        <TeacherDashboard
          teacherData={teacherData}
          onProfileUpdated={fetchTeacherData}
        />
      </div>
    </div>
  );
};

export default Teachermain;

