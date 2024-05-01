import React from 'react'
import logo from '..//..//..//assets/logo.png'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <>
            <footer className="bg-white rounded-lg shadow dark:bg-gray-900 m-4">
                <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <a className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                            <img src={logo} className="h-10 md:h-20" alt="Flowbite Logo" />
                            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"></span>
                        </a>
                        <ul className="flex items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 ">
                            <li>
                                <Link to={'/student-login'} className="hover:underline me-4 md:me-6 ">Student Login</Link>
                            </li>
                            <li>
                                <Link to={'/login'} className="hover:underline me-4 md:me-6 ">Teacher /Admin Login</Link>
                            </li>

                        </ul>
                    </div>
                    <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                    <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">Designed & Developed by <a  className="hover:underline text-orange-500 cursor-pointer">DOC-LABZ</a>.</span>
                </div>
            </footer>




        </>
    )
}

export default Footer