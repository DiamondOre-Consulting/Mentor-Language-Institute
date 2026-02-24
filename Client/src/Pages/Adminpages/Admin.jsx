import React, { useEffect } from "react";
import Admindash from "../../Component/AdminComponents/Admindash";
import AdminSidebar from "../../Component/AdminComponents/AdminSidebar";
import { useApi } from "../../api/useApi";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const { get } = useApi();
  // const [adminData , setAdminData] =useState([])

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

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
        const response = await get({
          url: "/admin-confi/my-profile",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
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
  }, [navigate, get]);

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-content">
        <Admindash />
      </div>
    </div>
  );
};

export default Admin;

