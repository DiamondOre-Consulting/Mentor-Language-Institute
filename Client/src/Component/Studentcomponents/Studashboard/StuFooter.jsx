import React from 'react'
import logo from '..//..//..//assets/logo.png'
import { Link } from 'react-router-dom'

const StuFooter = () => {
    return (
        <>


            <footer class="bg-white rounded-lg shadow dark:bg-gray-900 m-4">
                <div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                    <div class="sm:flex flex items-center sm:items-center justify-between  sm:justify-between">
                  
                            <img src={logo} class="h-10 md:h-20" alt="Flowbite Logo" />
                            {/* <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"></span> */}
                     
                        <ul class="flex flex-wrap items-center  text-sm font-medium text-gray-500 sm:mb-0 ">
                            <li>
                                <Link to={'/main-dashboard'} href="#" class="hover:underline me-4 md:me-6">Home</Link>
                            </li>
                            <li>
                                <a href="#enrolledcourse" class="hover:underline me-4 md:me-6">Enrolled Courses</a>
                            </li> 
                            
                        </ul>
                    </div>
                    <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                    <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400 text-center ">Designed & Developed by <a class="hover:underline text-orange-500">DOC-LABZ</a>.</span>
                </div>
            </footer>


        </>
    )
}

export default StuFooter