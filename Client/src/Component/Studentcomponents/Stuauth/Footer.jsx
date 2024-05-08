import React, { useEffect } from 'react';
import logo from '..//..//..//assets/logo.png';
import { Link } from 'react-router-dom';
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { decodedToken } = useJwt(token || "No decoded Token Found yet");
    console.log(token)

    const handleSignup = () => {
        if (token && decodedToken && decodedToken.exp * 1000 > Date.now()) {
            if (decodedToken.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (decodedToken.role === 'teacher') {
                navigate('/teacher-dashboard');
            } else {
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }


    return (
        <footer className="bg-white rounded-lg shadow dark:bg-gray-900 m-4 mt-20">
            <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
            <div class="sm:flex flex items-center sm:items-center justify-between  sm:justify-between">
                        {/* <img src={logo} className="h-8 md:h-20" alt="Flowbite Logo" /> */}
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"></span>
                
                    <ul className="flex items-center text-sm font-medium text-gray-500 sm:mb-0">
                        <li>
                            <Link to={'/student-login'} className="cursor-pointer hover:underline me-4 md:me-6 text-sm md:text-normal">Student Login</Link>
                        </li>
                        <li>
                            <span onClick={handleSignup}  className=" cursor-pointer hover:underline me-4 md:me-6 text-sm md:text-normal">Teacher /Admin Login</span>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400 text-center">Designed & Developed by <a className="hover:underline text-orange-500 cursor-pointer">DOC-LABZ</a>.</span>
            </div>
        </footer>
    );
};

export default Footer;
