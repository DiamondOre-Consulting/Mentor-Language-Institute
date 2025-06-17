import React, { useEffect } from 'react';
import logo from '..//..//..//assets/logo.png';
import { Link } from 'react-router-dom';
import { useJwt } from 'react-jwt'
import { useNavigate } from 'react-router-dom'
import insta from '..//..//../assets/instagram.png'
import facebook from '..//..//../assets/facebook.png'
import whatsapp from '..//..//../assets/whatsapp.png'
import linkedin from '..//..//../assets/linkedin.png'
import youtube from '..//..//../assets/youtube.png'

const Footer = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { decodedToken } = useJwt(token || "No decoded Token Found yet");

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


    const handleWhatsAppChat = () => {
         const phoneNumber = "8130265929";
        const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}`;
        window.open(url, '_blank');
    };

    return (
        <footer className="bg-white rounded-lg shadow  m-4 mt-20">
            <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                <div class="sm:flex flex items-center sm:items-center justify-between  sm:justify-between">
                    {/* <img src={logo} className="h-8 md:h-20" alt="Flowbite Logo" /> */}
                    <span className="self-center text-2xl font-semibold whitespace-nowrap "></span>

                    <ul className="flex items-center text-sm font-medium text-gray-500 sm:mb-0">
                        <li>
                            <Link to={'/student-login'} className="cursor-pointer hover:underline me-4 md:me-6 text-sm md:text-normal">Student Login</Link>
                        </li>
                        <li>
                            <span onClick={handleSignup} className=" cursor-pointer hover:underline me-4 md:me-6 text-sm md:text-normal">Teacher /Admin Login</span>
                        </li>
                    </ul>
                </div>

                <hr className="my-6 border-gray-200 sm:mx-auto  lg:my-8" />

                <div class="md:flex items-center justify-between">
                    <div></div>
                    <div class="flex flex-col-reverse md:flex-row justify-center items-center md:ml-0">
                        <div class="text-center flex flex-col items-center md:mr-64 md:text-left ">
                            <span class="block text-sm text-gray-500">Designed & Developed by <a href='https://www.doclabz.com/'  target= "_blank"  class="hover:underline text-orange-500 cursor-pointer">DOC-LABZ</a>.</span>
                            <span class="block text-sm text-gray-500 ">© 2024 <a href="" class="hover:underline">Mentor Institute</a>. All Rights Reserved.</span>
                        </div>
                        <div class="flex justify-end items-center mb-4 md:mb-0 md:ml-4">
                            <a href='https://www.instagram.com/mentorlanguage/' target='_blank'><img src={insta} alt="Instagram" class="w-8 cursor-pointer" /></a>
                            <a href='https://www.facebook.com/mentorlanguage/' target='_blank'><img src={facebook} alt="Facebook" class="w-8 ml-6" /></a>
                            <img src={whatsapp} alt="WhatsApp" class="w-8 ml-6" onClick={handleWhatsAppChat}  />
                            <a href='https://www.linkedin.com/company/mentor-the-language-institute/?viewAsMember=true' target='_blank'><img src={linkedin} alt="WhatsApp" class="w-8 ml-6" /></a>
                            <a href='https://youtube.com/@mentorlanguageinstitute8431?si=cztyFsLYOEKvWPO7' target='_blank'><img src={youtube} alt="Facebook" class="w-8 ml-6" /></a>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
