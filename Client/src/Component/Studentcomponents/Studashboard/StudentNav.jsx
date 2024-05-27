import React, { useState } from 'react'
import logo from '..//..//..//assets/logo.png'
import { Link, useNavigate } from 'react-router-dom';
import { useJwt } from 'react-jwt'

const StudentNav = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handleToggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    const { decodedToken } = useJwt(localStorage.getItem('token')); // Get decoded token

    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/student-login";
        // console.log("Logging out");
    };


    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <nav className="">
            <div className=" flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src={logo} className="h-12 md:h-16" alt="logo" />
                </a>
                <ul className="items-center  font-sm flex p-4 md:p-0 border border-0 md:border-gray-100 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0">
                    <li className='relative group flex items-center'>
                        <Link to={'/student/chat'} className="block py-1 px-2 text-gray-100 bg-orange-500  opacity-1 rounded md:px-4 md:py-1 rounded-full" aria-current="page" >Chat</Link>
                    </li>
                    <ul className='relative'>
                        <li>
                            <button
                                id="dropdownNavbarLink"
                                onClick={toggleDropdown}
                                className="text-gray-700  border-b border-gray-100 md:hover:bg-transparent md:border-0 pl-3 pr-4 py-2 md:hover:text-orange-400 md:p-0 font-medium flex items-center justify-between w-full md:w-auto"
                            >
                                Help ?
                                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <div
                                    id="dropdownNavbar"
                                    className="absolute -right-10 mt-2 bg-white text-base z-10 list-none divide-y divide-gray-100 rounded shadow w-54"
                                >
                                    <ul className="py-1" aria-labelledby="dropdownLargeButton">
                                        <li>
                                            <a href="#" className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">+91-9999466159</a>
                                        </li>

                                    </ul>
                                    <div className="py-1">
                                        <a href="#" className="text-sm hover:bg-gray-100 text-gray-700 text-wrap block px-4 py-2">mentor.languageclasses@gmail.com</a>
                                    </div>
                                </div>
                            )}
                        </li>
                    </ul>

                    <li className='relative group flex items-center'>
                        <Link to="#" className="block py-2 px-0 text-black opacity-1 rounded md:p-0" aria-current="page" onClick={handleLogout}>Logout</Link>
                        <svg class="h-6 w-6 text-gray-700 mx-1 hidden md:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />  <polyline points="16 17 21 12 16 7" />  <line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </li>



                </ul>

            </div>
        </nav>
    );
}

export default StudentNav