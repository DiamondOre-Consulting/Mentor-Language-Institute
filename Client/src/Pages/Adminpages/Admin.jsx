import React, { useEffect} from 'react'
import Admindash from '../../Component/AdminComponents/Admindash'
import AdminSidebar from '../../Component/AdminComponents/AdminSidebar'
import axios from "axios";
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'


const Admin = () => {
  const navigate = useNavigate();
  // const [adminData , setAdminData] =useState([])

  useEffect(()=>{
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
  },[navigate])



  const { decodedToken } = useJwt(localStorage.getItem("token"));
  console.log("token decoded",decodedToken);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const tokenExpiration = decodedToken ? (decodedToken.exp * 1000) + (20 * 1000) : 0; // Token expiration time in milliseconds, 20 seconds added


      if (tokenExpiration && tokenExpiration < Date.now()) {
        localStorage.removeItem("token");
        console.log("Token Expired")
        navigate("/login");
      }
    }
  }, [decodedToken , navigate])
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