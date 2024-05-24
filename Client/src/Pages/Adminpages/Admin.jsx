import React, { useEffect } from 'react'
import Admindash from '../../Component/AdminComponents/Admindash'
import AdminSidebar from '../../Component/AdminComponents/AdminSidebar'
import axios from "axios";
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'



const Admin = () => {
  const navigate = useNavigate();
  // const [adminData , setAdminData] =useState([])
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  // console.log(token)
  if (!token) {
    navigate("/login"); // Redirect to login page if not authenticated
    return;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // No token found, redirect to login page
      navigate("/login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds
      console.log(tokenExpiration)

      if (tokenExpiration && tokenExpiration < Date.now()) {
        // Token expired, remove from local storage and redirect to login page
        localStorage.removeItem("token");
        navigate("/admin-login");
      }
    }
  }, [decodedToken])

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {

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
          // console.log(response.data);
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
  }, [navigate , decodedToken])



 




  return (
    <>


      <AdminSidebar />
      <div className="admin-content">
        <Admindash />
      </div>

    </>
  )
}

export default Admin