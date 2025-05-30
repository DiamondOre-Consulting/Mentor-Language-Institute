import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

const UserVerify = ({ routeName }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                if (routeName === "admin-confi" || routeName === "teachers") {
                    navigate("/login");
                } else {
                    navigate("/");
                }
                return;
            }
            try {
                const response = await axios.get(
                    `http://localhost:7000/api/${routeName}/my-profile`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setLoading(false);
            } catch (error) {
                if (routeName === "admin-confi" || routeName === "teachers") {
                    navigate("/login");
                } else {
                    navigate("/");
                }
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="flex flex-row gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500 animate-bounce [animation-delay:.7s]"></div>
                <div className="w-4 h-4 rounded-full bg-orange-500 animate-bounce [animation-delay:.3s]"></div>
                <div className="w-4 h-4 rounded-full bg-orange-500 animate-bounce [animation-delay:.7s]"></div>
            </div>
        </div>;
    }

    return <Outlet />;
};

export default UserVerify;