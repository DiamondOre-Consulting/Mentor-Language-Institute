import { useEffect, useState } from "react";
import StudentNav from "../../Component/Studentcomponents/Studashboard/StudentNav";
import Studenthero from "../../Component/Studentcomponents/Studashboard/Studenthero";
import StudentOverview from "../../Component/Studentcomponents/Studashboard/StudentOverview";
import EnrolledCourses from "../../Component/Studentcomponents/Studashboard/EnrolledCourses";
import LanguageCourses from "../../Component/Studentcomponents/Studashboard/LanguageCourses";
import Classes from "../../Component/Studentcomponents/Studashboard/Classes";
import { useApi } from "../../api/useApi";
import SpecialCourses from "../../Component/Studentcomponents/Studashboard/SpecialCourses";
import { useNavigate } from "react-router-dom";

const Maindash = () => {
  const [studentData, setStudentData] = useState(null);
  const navigate = useNavigate();
  const { get } = useApi();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/student-login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          navigate("/login");
          return;
        }

        const response = await get({
          url: "/students/my-profile",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        if (response.status == 200) {
          const stu = response.data;
          setStudentData(stu);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [get, navigate]);

  return (
    <div className="student-shell min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50">
      <StudentNav student={studentData} onProfileUpdated={setStudentData} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <Studenthero naming={studentData} />
        <StudentOverview student={studentData} />
        <EnrolledCourses />
        <LanguageCourses />
        <SpecialCourses />
        <Classes />
      </main>
    </div>
  );
};

export default Maindash;

