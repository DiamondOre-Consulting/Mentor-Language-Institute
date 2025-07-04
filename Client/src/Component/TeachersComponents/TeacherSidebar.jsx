import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "..//..//assets/logo.png";
import { useJwt } from "react-jwt";
import { useNavigate } from "react-router-dom";
import insta from "..//..//assets/instagram.png";
import facebook from "..//..//assets/facebook.png";
import whatsapp from "..//..//assets/whatsapp.png";
import linkedin from "..//..//assets/linkedin.png";
import youtube from "..//..//assets/youtube.png";

const TeacherSidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { decodedToken } = useJwt(localStorage.getItem("token"));
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login"); // Redirect to login page if not authenticated
    return;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const tokenExpiration = decodedToken ? decodedToken.exp * 1000 : 0; // Convert expiration time to milliseconds
      // console.log(tokenExpiration)

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

  const handleWhatsAppChat = () => {
    const phoneNumber = "8130265929";
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(
      phoneNumber
    )}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <div className="sm:hidden fixed bg-white w-full  py-2">
        <button
          onClick={handleToggleMenu}
          className="block text-gray-800 hover:text-gray-500 focus:text-gray-500 focus:outline-none mt-4 px-4"
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
        className={`fixed top-0 left-0 z-40 w-64 h-screen  transition-transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div class="h-full px-3 py-4 overflow-y-hidden bg-gray-50 rounded-r-lg    ">
          <a href="" class="flex justify-between items-center ps-2.5 mb-5">
            <img
              src={logo}
              class="h-10 md:h-22 me-3 sm:h-16"
              alt="Flowbite Logo"
            />
            <button
              type="button"
              onClick={handleToggleMenu}
              className="sm:hidden text-gray-800 hover:text-gray-500 focus:text-gray-500 focus:outline-none mt-2 px-4"
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

          <ul class="space-y-2  font-medium">
            <li className="">
              <Link
                to="/teacher-dashboard/"
                className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100 hover:text-orange-500  group"
                // onClick={() => handleTabClick("home")}
              >
                <svg
                  class="w-6 h-6 text-gray-500  group-hover:text-orange-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="flex-1 ms-3 whitespace-nowrap"> Home </span>
              </Link>
            </li>

            <li>
              <Link
                to="/teacher-dashboard/mark-attendance"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  class="group-hover:text-orange-500 flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                </svg>
                <span class="flex-1 ms-3 whitespace-nowrap">
                  Mark Attendance
                </span>
                {/* <span class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full  ">3</span> */}
              </Link>
            </li>

            {/* <li>
              <Link
                to="/teacher-dashboard/teacher/chat"
                href="#"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  class="group-hover:text-orange-500 flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                </svg>
                <span class="flex-1 ms-3 whitespace-nowrap">Message</span>
              
              </Link>
            </li> */}

            <li>
              <Link
                to="/teacher-dashboard/all-students"
                href="#"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  class="flex-shrink-0 w-5 h-5 group-hover:text-orange-500 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span class="flex-1 ms-3 whitespace-nowrap">All Students</span>
              </Link>
            </li>

            <li>
              <Link
                to="/teacher-dashboard/add-student"
                href="#"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  class="flex-shrink-0 w-5 h-5 group-hover:text-orange-500 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span class="flex-1 ms-3 whitespace-nowrap">Add Student</span>
              </Link>
            </li>
            <li>
              <Link
                to="/teacher-dashboard/myaccount"
                href="#"
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  class="flex-shrink-0 w-5 h-5 group-hover:text-orange-500 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span class="flex-1 ms-3 whitespace-nowrap">My Account</span>
              </Link>
            </li>

            <li>
              <a
                href="#"
                onClick={handleLogout}
                class="hover:text-orange-500 flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  class="group-hover:text-orange-500  flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                  />
                </svg>
                <span class="flex-1 ms-3 whitespace-nowrap">Logout</span>
              </a>
            </li>
          </ul>
          <hr class=" border-gray-200 sm:mx-auto  mt-48" />

          <div class="flex justify-between items-center mb-4 md:mb-0 mt-4 px-4">
            <a href="https://www.instagram.com/mentorlanguage/" target="_blank">
              <img src={insta} alt="Instagram" class="w-6 cursor-pointer" />
            </a>
            <a href="https://www.facebook.com/mentorlanguage/" target="_blank">
              <img src={facebook} alt="Facebook" class="w-6 " />
            </a>
            <img
              src={whatsapp}
              alt="WhatsApp"
              class="w-6 "
              onClick={handleWhatsAppChat}
            />
            <a
              href="https://www.linkedin.com/company/mentor-the-language-institute/?viewAsMember=true"
              target="_blank"
            >
              <img src={linkedin} alt="WhatsApp" class="w-6 " />
            </a>
            <a
              href="https://youtube.com/@mentorlanguageinstitute8431?si=cztyFsLYOEKvWPO7"
              target="_blank"
            >
              <img src={youtube} alt="Facebook" class="w-6 " />
            </a>
          </div>

          <div class="text-center mt-2">
            <span class="block text-xs text-gray-500">
              Designed & Developed by{" "}
              <a
                href="https://www.doclabz.com/"
                target="_blank"
                class="hover:underline text-orange-500 cursor-pointer"
              >
                DOC-LABZ
              </a>
              .
            </span>
            <span class="block text-xs text-gray-500 ">
              © 2024{" "}
              <a href="" class="hover:underline">
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

export default TeacherSidebar;
