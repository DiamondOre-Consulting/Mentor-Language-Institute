import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const StudentLogin = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, SetPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "https://mentor-language-institute-backend-hbyk.onrender.com/api/students/login",
        {
          userName,
          password,
        }
      );

      if (response.status === 200) {
        const token = response.data.token;
        // Store the token in local storage
        localStorage.setItem("token", token);
        navigate("/main-dashboard");
      } else {
        setError("Login Details Are Wrong!!");
        // Handle login error
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          setError("Invalid UserName ");
        } else if (status === 402) {
          setError("Your account has been deactivated!!");
        } else if (status === 403) {
          setError("invalid Password");
        } else {
          setError("Login Details Are Wrong!!");
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Navbar />
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <ClipLoader
            color={"#FFA500"}
            loading={loading}
            css={override}
            size={70}
          />
        </div>
      )}
      <div className="mt-20 md:mt-12 flex items-center justify-center">
        <div className="bg-white  shadow-xl rounded-lg px-8 py-6 w-3/4 md:max-w-md">
          <h1 className="text-3xl font-bold text-center mb-1 ">LOGIN</h1>
          <div className="md:w-96 h-0.5 rounded bg-orange-500 mb-4"></div>
          <form onSubmit={handleStudentLogin} className="">
            <div className="mb-4">
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700  mb-2"
              >
                username
              </label>
              <input
                type="text"
                name="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter UserName"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700  mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full p-4 text-sm rounded-lg shadow-sm border-1 pe-12"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => SetPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    aria-describedby="remember"
                    id="check"
                    type="checkbox"
                    value={showPassword}
                    onChange={() => setShowPassword((prev) => !prev)}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300    "
                    required=""
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-500 ">
                    Show password
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <Link
                to="/"
                class="text-xs mt-2 text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Account
              </Link>
            </div>
            <div className="w-full">
              <button className="w-full p-2 text-white bg-orange-400 rounded-md">
                Login
              </button>
            </div>
          </form>

          {error && (
            <div className="flex items-center justify-center p-4 bg-red-300 rounded-md">
              <p className="text-sm text-center text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default StudentLogin;
