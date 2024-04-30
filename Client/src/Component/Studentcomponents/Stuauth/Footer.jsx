import React from 'react'
import logo from '..//..//..//assets/logo.png'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <>
            <footer class="bg-white rounded-lg shadow dark:bg-gray-900 m-4">
                <div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                    <div class="sm:flex sm:items-center sm:justify-between">
                        <a class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                            <img src={logo} class="h-10 md:h-20" alt="Flowbite Logo" />
                            <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"></span>
                        </a>
                        <ul class="flex items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 ">
                            <li>
                                <Link to={'/student-login'} class="hover:underline me-4 md:me-6 ">Student Login</Link>
                            </li>
                            <li>
                                <Link to={'/login'} class="hover:underline me-4 md:me-6 ">Teacher /Admin Login</Link>
                            </li>

                        </ul>
                    </div>
                    <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                    <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400">Designed & Developed by <a href="https://flowbite.com/" class="hover:underline text-orange-500">DOC-LABZ</a>.</span>
                </div>
            </footer>




        </>
    )
}

export default Footer