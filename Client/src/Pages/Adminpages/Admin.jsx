import React, { useEffect, useState } from 'react'
import Admindash from '../../Component/AdminComponents/Admindash'
import AdminSidebar from '../../Component/AdminComponents/AdminSidebar'
import axios from "axios";

const Admin = () => {

  const [adminData , setAdminData] =useState(null);

  

  useEffect(()=>{
    const fetchAdminData = async () => {
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
          "http://localhost:7000/api/admin-confi/my-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status == 200) {
          console.log(response.data);
          // setUserData(response.data);
        } else {
          console.log(response.data);
          // setUserData("Did not get any response!!!");
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        // Handle error and show appropriate message
      }
    };

    fetchAdminData();
  },[])
  return (
    <>



     <AdminSidebar/>
      <div className="admin-content">
        <Admindash/>
      </div>

    </>
  )
}

export default Admin