import React, { useEffect, useState } from "react";
import logo from "..//..//assets/logo.png";
import { Link } from "react-router-dom";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";
import insta from "..//..//assets/instagram.png";
import facebook from "..//..//assets/facebook.png";
import whatsapp from "..//..//assets/whatsapp.png";
import linkedin from "..//..//assets/linkedin.png";
import youtube from "..//..//assets/youtube.png";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");
  // console.log("this is",token)
  if (!token) {
    navigate("/login"); // Redirect to login page if not authenticated
    return;
  }

  const handleWhatsAppChat = () => {
    const phoneNumber = "8130265929";
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(
      phoneNumber
    )}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    // console.log(token)
    if (!token) {
      // No token found, redirect to login page
      navigate("/login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds

      if (tokenExpiration && tokenExpiration < Date.now()) {
        // Token expired, remove from local storage and redirect to login page
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [decodedToken]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
    // console.log("Logging out");
  };

  const handleToggleMenu = (e) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="sm:hidden">
        <button
          onClick={handleToggleMenu}
          className="block px-4 mt-4 text-gray-800 hover:text-gray-500 focus:text-gray-500 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12"></path>
            ) : (
              <path d="M4 6h16M4 12h16m-7 6h7"></path>
            )}
          </svg>
        </button>
      </div>

      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 rounded-r-lg    ">
          <a href="" className="flex justify-between items-center ps-2.5 mb-5">
            <img
              src={logo}
              className="h-10 md:h-22 me-3 sm:h-16"
              alt="Flowbite Logo"
            />
            <button
              type="button"
              onClick={handleToggleMenu}
              className="px-4 mt-2 text-gray-800 sm:hidden hover:text-gray-500 focus:text-gray-500 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </a>

          <ul className="space-y-2 font-medium">
            <li className="">
              <Link
                to="/admin-dashboard/"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 hover:text-orange-500 group"
                onClick={() => handleTabClick("home")}
              >
                <svg
                  className="w-6 h-6 text-gray-500  group-hover:text-orange-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap"> Home </span>
              </Link>
            </li>
            <li className="">
              <Link
                to="/admin-dashboard/register"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:text-orange-500 hover:bg-gray-100 group"
                onClick={() => handleTabClick("register")}
              >
                <svg
                  className="w-6 h-6 text-gray-500  group-hover:text-orange-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 6a3 3 0 1 1 4 2.83V10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8.83a3.001 3.001 0 1 1 2 0V10a3 3 0 0 1-3 3h-1v2.17a3.001 3.001 0 1 1-2 0V13h-1a3 3 0 0 1-3-3V8.83A3.001 3.001 0 0 1 5 6Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap"> Register</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin-dashboard/allstudents"
                href="#"
                class="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  hover:text-orange-500 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 group-hover:text-orange-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  All Students
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin-dashboard/allteachers"
                href="#"
                class="flex items-center hover:text-orange-500  p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="flex-shrink-0 group-hover:text-orange-500 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  All Teachers
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin-dashboard/allcourses"
                href="#"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 group-hover:text-orange-500 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  All Courses
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin-dashboard/admin/chat/"
                href="#"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 group-hover:text-orange-500 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Chats</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin-dashboard/all-admin"
                href="#"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="group-hover:text-orange-500 flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">All Admin</span>
                {/* <span class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full  ">3</span> */}
              </Link>
            </li>

            <li>
              <Link
                to="/admin-dashboard/messages"
                href="#"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="group-hover:text-orange-500 flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Applied Request
                </span>
                {/* <span class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full  ">3</span> */}
              </Link>
            </li>

            <li>
              <Link
                to="/admin-dashboard/attendance-report"
                href="#"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="group-hover:text-orange-500 flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Attendance Report
                </span>
                {/* <span class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full  ">3</span> */}
              </Link>
            </li>
            <li>
              <a
                href="#"
                onClick={handleLogout}
                className="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="group-hover:text-orange-500  flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Logout</span>
              </a>
            </li>
          </ul>
          <hr className=" border-gray-200 sm:mx-auto  mt-4" />

          <div className="flex justify-between items-center mb-4 md:mb-0 mt-4 px-4">
            <a href="https://www.instagram.com/mentorlanguage/" target="_blank">
              <img src={insta} alt="Instagram" className="w-6 cursor-pointer" />
            </a>
            <a href="https://www.facebook.com/mentorlanguage/" target="_blank">
              <img src={facebook} alt="Facebook" className="w-6 " />
            </a>
            <img
              src={whatsapp}
              alt="WhatsApp"
              className="w-6 "
              onClick={handleWhatsAppChat}
            />
            <a
              href="https://www.linkedin.com/company/mentor-the-language-institute/?viewAsMember=true"
              target="_blank"
            >
              <img src={linkedin} alt="WhatsApp" className="w-6 " />
            </a>
            <a
              href="https://youtube.com/@mentorlanguageinstitute8431?si=cztyFsLYOEKvWPO7"
              target="_blank"
            >
              <img src={youtube} alt="Facebook" className="w-6 " />
            </a>
          </div>

          <div className="text-center mt-2">
            <span className="block text-xs text-gray-500">
              Designed & Developed by{" "}
              <a
                href="https://www.doclabz.com/"
                target="_blank"
                className="hover:underline text-orange-500 cursor-pointer"
              >
                DOC-LABZ
              </a>
              .
            </span>
            <span className="block text-xs text-gray-500 ">
              © 2024{" "}
              <a href="" className="hover:underline">
                Mentor Institute
              </a>
              . All Rights Reserved.
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
