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
        console.log("Logging out");
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
                    <select className='w-24 md:w-28 h-10  rounded-full focus:border-gray-200  md:border-1 md:border-gray-600 border-0 cursor-pointer'>
                        <option className=''>Help?</option>
                        <option className=''>+91-9999466159</option>
                        <option className='text-wrap '>mentor.languageclasses@gmail.com</option>
                    </select>

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