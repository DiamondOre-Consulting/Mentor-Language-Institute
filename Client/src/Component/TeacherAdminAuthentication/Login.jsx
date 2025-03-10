import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Studentcomponents/Stuauth/Navbar";
import Footer from "../Studentcomponents/Stuauth/Footer";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Login = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [phone, setPhone] = useState("");
  const [username, adminSetusername] = useState("");
  const [password, SetPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ADMIN LOGIN
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Perform login logic here
    try {
      const response = await axios.post(
        "https://mentor-language-institute-backend-hbyk.onrender.com/api/admin-confi/login-admin",
        {
          username,
          password,
        }
      );
      // console.log("inside")

      if (response.status === 200) {
        // console.log(response.data)
        const token = response.data.token;
        // Store the token in local storage

        localStorage.setItem("token", token);
        // console.log("Logged in successfully as Admin");
        navigate("/admin-dashboard");
      } else {
        console.log("Login failed");
        setError("Login Details Are Wrong!!");
        // Handle login error
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          console.log("Invalid phone number");
          setError("Login Details Are Wrong!!");
        } else {
          console.error("Error logging in:", status);
          setError("Login Details Are Wrong!!");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // TEACHER LOGIN

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "https://mentor-language-institute-backend-hbyk.onrender.com/api/teachers/login-teacher",
        {
          phone,
          password,
        }
      );

      if (response.status === 200) {
        const token = response.data.token;

        // console.log(token)
        localStorage.setItem("token", token);
        // console.log("Logged in successfully as Teacher");
        navigate("/teacher-dashboard");
      } else {
        console.log("Login failed");
        setError("Login Details Are Wrong!!");
        // Handle login error
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          console.log("invalid phone no");
          setError("Invalid Phone No");
        } else if (status === 402) {
          console.log("invalid passward");
          setError("Invalid password");
        } else {
          console.error("Error login teacher:", status);
          setError("Login Details Are Wrong!!");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowPassword = () => {
    return setShowPass(!showPass);
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
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
      <div className="-mt-10">
        <div className="flex flex-col items-center justify-center">
          <div className="py-4">
            {activeTab === 0 && (
              <section className="relative">
                <div className="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                  <div className="md:w-full sm:w-1/2 bg-white rounded-lg shadow-lg  md:mt-0 sm:max-w-md xl:p-0">
                    <div className="flex space-x-4 md:space-x-10 ">
                      <button
                        className={`py-2 px-4 md:px-10 border-b-2 ${activeTab === 0
                            ? "border-orange-500"
                            : "border-transparent"
                          } focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                      >
                        Admin Login
                      </button>
                      <button
                        className={`py-2 px-4 md:px-10 border-b-2 ${activeTab === 1
                            ? "border-orange-500"
                            : "border-transparent"
                          } focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                      >
                        Teacher Login
                      </button>
                    </div>
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <h1 className="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                          Admin
                        </h1>
                      </div>

                      <form
                        className="space-y-4 md:space-y-6"
                        action="#"
                        onSubmit={handleAdminLogin}
                      >
                        <div>
                          <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={(e) => adminSetusername(e.target.value)}
                            placeholder="Enter Username"
                            className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                            required=""
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="sr-only">
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
                                onChange={() =>
                                  setShowPassword((prev) => !prev)
                                }
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
                          {/* <a href="#" class="text-sm font-medium text-primary-600 hover:underline ">Forgot password?</a> */}
                        </div>
                        <div className="w-full">
                          <button className="w-full p-2 text-white bg-orange-400 rounded-md md:w-96">
                            Login
                          </button>
                        </div>

                        <a
                          href="#"
                          className="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline "
                        >
                          <Link to={"/"} className="underline"></Link>
                        </a>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            )}
            {activeTab === 1 && (
              <section className="relative">
                <div className="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                  <div className="md:w-full sm:w-1/2 bg-white rounded-lg shadow-lg  md:mt-0 sm:max-w-md xl:p-0">
                    <div className="flex space-x-4 md:space-x-10 ">
                      <button
                        className={`py-2 px-4 md:px-10 border-b-2 ${activeTab === 0
                            ? "border-orange-500"
                            : "border-transparent"
                          } focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                      >
                        Admin Login
                      </button>
                      <button
                        className={`py-2 px-4 md:px-10 border-b-2 ${activeTab === 1
                            ? "border-orange-500"
                            : "border-transparent"
                          } focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                      >
                        Teacher Login
                      </button>
                    </div>
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <h1 className="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                          Teacher
                        </h1>
                      </div>

                      <form
                        className="space-y-4 md:space-y-6"
                        action="#"
                        onSubmit={handleTeacherLogin}
                      >
                        <div>
                          <input
                            type="text"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter Phone"
                            className="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                            required=""
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="sr-only">
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
                                onChange={() =>
                                  setShowPassword((prev) => !prev)
                                }
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
                          {/* <a href="#" class="text-sm font-medium text-primary-600 hover:underline ">Forgot password?</a> */}
                        </div>
                        <div className="w-full">
                          <button className="w-full p-2 text-white bg-orange-400 rounded-md md:w-96">
                            Login
                          </button>
                        </div>

                        <a
                          href="#"
                          className="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline "
                        >
                          <Link to={"/"} className="underline"></Link>
                        </a>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {error && (
              <div className="flex items-center justify-center p-4 bg-red-300 rounded-md">
                <p className="text-sm text-center text-red-500">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Login;
