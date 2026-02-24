import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";

const UserVerify = ({ routeName }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const { get } = useApi();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const redirectTo =
        routeName === "admin-confi" || routeName === "teachers"
          ? "/login"
          : "/student-login";
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthorized(false);
        setLoading(false);
        navigate(redirectTo);
        return;
      }
      try {
        await get({
          url: `/${routeName}/my-profile`,
          headers: { Authorization: `Bearer ${token}` },
        }).unwrap();
        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        setAuthorized(false);
        setLoading(false);
        navigate(redirectTo);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-row gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500 animate-bounce [animation-delay:.7s]"></div>
          <div className="w-4 h-4 rounded-full bg-orange-500 animate-bounce [animation-delay:.3s]"></div>
          <div className="w-4 h-4 rounded-full bg-orange-500 animate-bounce [animation-delay:.7s]"></div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <Outlet />;
};

export default UserVerify;

