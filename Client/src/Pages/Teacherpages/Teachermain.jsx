import React from 'react'
import TeacherSidebar from '../../Component/TeachersComponents/TeacherSidebar'
import TeacherDashboard from '../../Component/TeachersComponents/TeacherDashboard'

const Teachermain = () => {

  const [teacherData , setTeacherData] =useState(null);

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
          "http://localhost:7000/api/teachers/my-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status == 200) {
          console.log("teacherdata",response.data);
          const all = response.data;
          setStudentData(all);
     
        } else {
          console.log(response.data);
          
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        
      }
    };

    fetchStudentData();
  },[])

  return (
    <>
       <TeacherSidebar/>
      <div className="admin-content">
        <TeacherDashboard/>
      </div>
    </>
  )
}

export default Teachermain