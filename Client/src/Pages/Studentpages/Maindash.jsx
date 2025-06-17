import React, { useEffect, useState } from "react";
import StudentNav from "../../Component/Studentcomponents/Studashboard/StudentNav";
import Studenthero from "../../Component/Studentcomponents/Studashboard/Studenthero";
import EnrolledCourses from "../../Component/Studentcomponents/Studashboard/EnrolledCourses";
import LanguageCourses from "../../Component/Studentcomponents/Studashboard/LanguageCourses";
import Classes from "../../Component/Studentcomponents/Studashboard/Classes";
import StuFooter from "../../Component/Studentcomponents/Studashboard/StuFooter";
import axios from "axios";
import SpecialCourses from "../../Component/Studentcomponents/Studashboard/SpecialCourses";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";

const Maindash = () => {
  const [studentData, setStudentData] = useState(null);
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
      navigate("/student-login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds

      if (tokenExpiration && tokenExpiration < Date.now()) {
        localStorage.removeItem("token");
        navigate("/student-login");
      }
    }
  }, [decodedToken]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://mentor-backend-rbac6.ondigitalocean.app/api/students/my-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status == 200) {
          const stu = response.data;
          setStudentData(stu);
        } else {
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [decodedToken]);

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
  );
};

export default Maindash;
