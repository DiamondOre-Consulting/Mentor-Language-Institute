import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "..//..//..//assets/logo.png";
import Navbar from "./Navbar";
import axios from "axios";
import Footer from "./Footer";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Parentlog = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setdob] = useState();
  const [userName, setUserName] = useState("");
  const [popupMessage, setPopupMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [branch, setBranch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShowPassword = () => {
    return setShowPass(!showPass);
  };

  const handleStudentRegister = async (e) => {
    setLoading(true);
    e.preventDefault();
    setPopupMessage(null);

    try {
      const response = await axios.post(
        "https://mentor-backend-rbac6.ondigitalocean.app/api/students/signup",
        {
          name,
          phone,
          password,
          branch,
          userName,
          dob,
        }
      );

      if (response.status === 200) {
        setPopupMessage("Student Registered Successfully");
        setName("");
        setPhone("");
        setPassword("");
        navigate("/student-login");
      } else if (response.status === 400) {
        setPopupMessage("Please Enter a Unique UserName");
      } else {
        setPopupMessage("Error Registering Student");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          console.log("Student already registered");
          setPopupMessage("Please Enter a Unique UserName");
        } else {
          console.error("Error adding Student:", status);
          setPopupMessage("Error Registering Student");
        }
      } else {
        console.error("Error adding student:", error.message);
        setPopupMessage("Error Registering Student");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section class="relative mt-10 md:-mt-12">
        {loading && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
            <ClipLoader
              color={"#FFA500"}
              loading={loading}
              css={override}
              size={70}
            />
          </div>
        )}
        <div class="flex flex-col items-center justify-center mt-16 lg:py-0 ">
          <div class="md:w-full sm:w-1/2 bg-white rounded-lg shadow border-t-4 border-orange-400 md:mt-0 sm:max-w-md xl:p-0">
            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
              <div className="flex justify-between items-center">
                <h1 class="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                  Student Registration Form
                </h1>
                {/* <img src={logo} alt="" className='w-24' /> */}
              </div>

              <form
                class="space-y-4 md:space-y-6"
                onSubmit={handleStudentRegister}
              >
                <div>
                  <input
                    type="text"
                    name="userName"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Please Enter a unique userName"
                    class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Your Name"
                    class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>

                <div>
                  <input
                    type="phone"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number"
                    class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5      "
                    required=""
                  />
                </div>

                <select
                  id="branch"
                  name="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-2 border border-gray-500 rounded-md"
                >
                  <option>Select Branch</option>
                  <option value="Noida-107">Noida-107</option>
                  <option value="Noida-51">Noida-51</option>
                  <option value="East Delhi">East Delhi</option>
                </select>
                <div className="flex items-center justify-between w-full p-2 border border-gray-500 rounded-md">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900 "
                    htmlFor="dob"
                  >
                    Date of Birth:
                  </label>
                  <input
                    type="date"
                    id="dob"
                    value={dob}
                    className=" rounded-lg outline-none h-8 focus:ring-0"
                    onChange={(e) => setdob(e.target.value)} // Capture the date input
                    required
                    placeholder="Data of Birth"
                  />
                </div>
                <div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    class="bg-gray-50 border border-gray-900 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5      "
                    required=""
                  />
                </div>

                <div class="flex items-center mt-2">
                  <input
                    type="checkbox"
                    class="mr-2"
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label
                    class="text-sm font-medium text-gray-900  cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    Show Password
                  </label>
                </div>

                <div className="w-full">
                  <button className="bg-orange-400 text-white w-full p-2 rounded-md">
                    Register
                  </button>
                </div>

                <a class="text-center flex items-center justify-center text-sm font-medium text-primary-600 ">
                  Already Have Account?{" "}
                  <Link to={"/student-login"} className="underline ml-1">
                    {" "}
                    Sign in
                  </Link>
                </a>
              </form>
              {popupMessage && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <svg
                      class="h-6 w-6 text-red-500 float-right -mt-2 cursor-pointer"
                      onClick={() => setPopupMessage(null)}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      {" "}
                      <path stroke="none" d="M0 0h24v24H0z" />{" "}
                      <line x1="18" y1="6" x2="6" y2="18" />{" "}
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <p className="text-lg font-bold mt-4 text-green-700">
                      {popupMessage}
                    </p>
                    {/* <button className="bg-orange-500 text-white py-2 px-4 rounded-md" onClick={() => setPopupMessage(null)}>Close</button> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Parentlog;
