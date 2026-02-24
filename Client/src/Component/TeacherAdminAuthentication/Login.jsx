import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Studentcomponents/Stuauth/Navbar";
import { useApi } from "../../api/useApi";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Login = ({ defaultTab }) => {
  const { post } = useApi();
  const location = useLocation();
  const resolveDefaultTab = () => {
    const role = new URLSearchParams(location.search).get("role");
    const normalizedRole = role ? role.toLowerCase() : "";
    if (defaultTab === "student" || location.pathname === "/student-login") {
      return 2;
    }
    if (defaultTab === "teacher" || normalizedRole === "teacher") {
      return 1;
    }
    if (defaultTab === "admin" || normalizedRole === "admin") {
      return 0;
    }
    if (normalizedRole === "student") {
      return 2;
    }
    return 0;
  };

  const [activeTab, setActiveTab] = useState(resolveDefaultTab);
  const [teacherPhone, setTeacherPhone] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [studentUserName, setStudentUserName] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
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
      const response = await post({
        url: "/admin-confi/login-admin",
        data: {
          username: adminUsername,
          password: adminPassword,
        },
      }).unwrap();
      // console.log("inside")

      if (response.status === 200) {
        // console.log(response.data)
        const token = response.data.token;
        // Store the token in local storage

        localStorage.setItem("token", token);
        // console.log("Logged in successfully as Admin");
        navigate("/admin-dashboard");
      } else {
        setError("Login Details Are Wrong!!");
        // Handle login error
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
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
      const response = await post({
        url: "/teachers/login-teacher",
        data: {
          phone: teacherPhone,
          password: teacherPassword,
        },
      }).unwrap();

      if (response.status === 200) {
        const token = response.data.token;

        // console.log(token)
        localStorage.setItem("token", token);
        // console.log("Logged in successfully as Teacher");
        navigate("/teacher-dashboard");
      } else {
        setError("Login Details Are Wrong!!");
        // Handle login error
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          setError("Invalid Phone No");
        } else if (status === 402) {
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

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await post({
        url: "/students/login",
        data: {
          userName: studentUserName,
          password: studentPassword,
        },
      }).unwrap();

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        navigate("/main-dashboard");
      } else {
        setError("Login Details Are Wrong!!");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          setError("Invalid UserName");
        } else if (status === 402) {
          setError("Your account has been deactivated!!");
        } else if (status === 403) {
          setError("Invalid Password");
        } else {
          setError("Login Details Are Wrong!!");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
    setError(null);
  };

  useEffect(() => {
    setActiveTab(resolveDefaultTab());
  }, [location.pathname, location.search, defaultTab]);

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
      <div className="mt-6 sm:mt-10 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center">
          <div className="py-4 w-full">
            {activeTab === 0 && (
              <section className="relative">
                <div className="flex flex-col items-center justify-center mt-10 sm:mt-16">
                  <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
                    <div className="flex flex-wrap items-center gap-2 border-b border-orange-100 px-3 pt-3">
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 0
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                      >
                        Admin Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 1
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                      >
                        Teacher Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 2
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(2)}
                      >
                        Student Login
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
                            value={adminUsername}
                            onChange={(e) => setAdminUsername(e.target.value)}
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
                              value={adminPassword}
                              onChange={(e) => setAdminPassword(e.target.value)}
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
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="remember"
                                className="text-gray-500 "
                              >
                                Show password
                              </label>
                            </div>
                          </div>
                          {/* <a href="#" className="text-sm font-medium text-primary-600 hover:underline ">Forgot password?</a> */}
                        </div>
                        <div className="w-full">
                          <button className="w-full p-2 text-white bg-orange-400 rounded-md">
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
                <div className="flex flex-col items-center justify-center mt-10 sm:mt-16">
                  <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
                    <div className="flex flex-wrap items-center gap-2 border-b border-orange-100 px-3 pt-3">
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 0
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                      >
                        Admin Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 1
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                      >
                        Teacher Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 2
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(2)}
                      >
                        Student Login
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
                            value={teacherPhone}
                            onChange={(e) => setTeacherPhone(e.target.value)}
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
                              value={teacherPassword}
                              onChange={(e) => setTeacherPassword(e.target.value)}
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
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="remember"
                                className="text-gray-500 "
                              >
                                Show password
                              </label>
                            </div>
                          </div>
                          {/* <a href="#" className="text-sm font-medium text-primary-600 hover:underline ">Forgot password?</a> */}
                        </div>
                        <div className="w-full">
                          <button className="w-full p-2 text-white bg-orange-400 rounded-md">
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

            {activeTab === 2 && (
              <section className="relative">
                <div className="flex flex-col items-center justify-center mt-10 sm:mt-16">
                  <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
                    <div className="flex flex-wrap items-center gap-2 border-b border-orange-100 px-3 pt-3">
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 0
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                      >
                        Admin Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 1
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                      >
                        Teacher Login
                      </button>
                      <button
                        className={`flex-1 min-w-[120px] py-2 px-3 text-sm sm:text-base border-b-2 ${
                          activeTab === 2
                            ? "border-orange-500"
                            : "border-transparent"
                        } focus:outline-none`}
                        onClick={() => handleTabClick(2)}
                      >
                        Student Login
                      </button>
                    </div>
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <h1 className="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                          Student
                        </h1>
                      </div>

                      <form
                        className="space-y-4 md:space-y-6"
                        action="#"
                        onSubmit={handleStudentLogin}
                      >
                        <div>
                          <input
                            type="text"
                            name="userName"
                            value={studentUserName}
                            onChange={(e) =>
                              setStudentUserName(e.target.value)
                            }
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
                              value={studentPassword}
                              onChange={(e) =>
                                setStudentPassword(e.target.value)
                              }
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
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="remember"
                                className="text-gray-500 "
                              >
                                Show password
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="w-full">
                          <button className="w-full p-2 text-white bg-orange-400 rounded-md">
                            Login
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Link
                            to="/"
                            className="text-xs mt-2 text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Create Account
                          </Link>
                        </div>
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

    </>
  );
};

export default Login;

