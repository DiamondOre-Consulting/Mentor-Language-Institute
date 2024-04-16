import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Login = () => {

    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (index) => {
        setActiveTab(index);
    };
    
    return (
        <>
        <Navbar/>
            <div className='-mt-10'>
                <div className="flex flex-col justify-center items-center">

                    <div className="py-4">
                        {activeTab === 0 && (
                            <section class="relative">

                                <div class="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                                    <div class="md:w-full sm:w-1/2 bg-white rounded-lg shadow-lg  md:mt-0 sm:max-w-md xl:p-0">
                                        <div className="flex space-x-4  ">
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 0 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(0)}
                                            >
                                                Student Login
                                            </button>
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 1 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(1)}
                                            >
                                                Admin Login
                                            </button>
                                            <button
                                                className={`py-2 px-4 border-b-2 ${activeTab === 2 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                                onClick={() => handleTabClick(2)}
                                            >
                                                Teacher Login
                                            </button>
                                        </div>
                                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                            <div className='flex justify-between items-center'>
                                                <h1 class="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                                   Student
                                                </h1>


                                            </div>

                                            <form class="space-y-4 md:space-y-6" action="#">

                                                <div>
                                                    <input type="phone" name="phone" id="phone" placeholder="Enter Phone" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                                </div>
                                                <div>
                                                    <input type="password" name="password" id="password" placeholder="Enter Your password" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                                </div>


                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-start">
                                                        <div class="flex items-center h-5">
                                                            <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-gray-900 dark:ring-offset-gray-800" required="" />
                                                        </div>
                                                        <div class="ml-3 text-sm">
                                                            <label for="remember" class="text-gray-500 dark:text-gray-300">Show password</label>
                                                        </div>
                                                    </div>
                                                    <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                                                </div>
                                                <div className='w-full'>
                                                    <Link to={'/main-dashboard '}><button className='bg-orange-400 text-white w-full p-2 rounded-md'>Login</button></Link>
                                                </div>

                                                <a href="#" class="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Do not have account?<Link to={'/'} className='underline'>Sign up</Link></a>

                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                        {activeTab === 1 && (
                            <section class="relative">

                            <div class="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                                <div class="md:w-full sm:w-1/2 bg-white rounded-lg shadow-lg  md:mt-0 sm:max-w-md xl:p-0">
                                    <div className="flex space-x-4  ">
                                        <button
                                            className={`py-2 px-4 border-b-2 ${activeTab === 0 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                            onClick={() => handleTabClick(0)}
                                        >
                                            Student Login
                                        </button>
                                        <button
                                            className={`py-2 px-4 border-b-2 ${activeTab === 1 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                            onClick={() => handleTabClick(1)}
                                        >
                                            Admin Login
                                        </button>
                                        <button
                                            className={`py-2 px-4 border-b-2 ${activeTab === 2 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                            onClick={() => handleTabClick(2)}
                                        >
                                            Teacher Login
                                        </button>
                                    </div>
                                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                        <div className='flex justify-between items-center'>
                                            <h1 class="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                               Admin
                                            </h1>


                                        </div>

                                        <form class="space-y-4 md:space-y-6" action="#">

                                            <div>
                                                <input type="phone" name="phone" id="phone" placeholder="Enter Phone" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                            </div>
                                            <div>
                                                <input type="password" name="password" id="password" placeholder="Enter Your password" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                            </div>


                                            <div class="flex items-center justify-between">
                                                <div class="flex items-start">
                                                    <div class="flex items-center h-5">
                                                        <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-gray-900 dark:ring-offset-gray-800" required="" />
                                                    </div>
                                                    <div class="ml-3 text-sm">
                                                        <label for="remember" class="text-gray-500 dark:text-gray-300">Show password</label>
                                                    </div>
                                                </div>
                                                <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                                            </div>
                                            <div className='w-full'>
                                                <Link to={'/main-dashboard'}><button className='bg-orange-400 text-white w-full p-2 rounded-md'>Login</button></Link>
                                            </div>

                                            <a href="#" class="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Do not have account?<Link to={'/'} className='underline'>Sign up</Link></a>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                        )}
                        {activeTab === 2 && (
                            <section class="relative">

                            <div class="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                                <div class="md:w-full sm:w-1/2 bg-white rounded-lg shadow-lg  md:mt-0 sm:max-w-md xl:p-0">
                                    <div className="flex space-x-4  ">
                                        <button
                                            className={`py-2 px-4 border-b-2 ${activeTab === 0 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                            onClick={() => handleTabClick(0)}
                                        >
                                            Student Login
                                        </button>
                                        <button
                                            className={`py-2 px-4 border-b-2 ${activeTab === 1 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                            onClick={() => handleTabClick(1)}
                                        >
                                            Admin Login
                                        </button>
                                        <button
                                            className={`py-2 px-4 border-b-2 ${activeTab === 2 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                                            onClick={() => handleTabClick(2)}
                                        >
                                            Teacher Login
                                        </button>
                                    </div>
                                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                        <div className='flex justify-between items-center'>
                                            <h1 class="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                                Teacher
                                            </h1>


                                        </div>

                                        <form class="space-y-4 md:space-y-6" action="#">

                                            <div>
                                                <input type="phone" name="phone" id="phone" placeholder="Enter Phone" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                            </div>
                                            <div>
                                                <input type="password" name="password" id="password" placeholder="Enter Your password" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                            </div>


                                            <div class="flex items-center justify-between">
                                                <div class="flex items-start">
                                                    <div class="flex items-center h-5">
                                                        <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-gray-900 dark:ring-offset-gray-800" required="" />
                                                    </div>
                                                    <div class="ml-3 text-sm">
                                                        <label for="remember" class="text-gray-500 dark:text-gray-300">Show password</label>
                                                    </div>
                                                </div>
                                                <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                                            </div>
                                            <div className='w-full'>
                                                <Link to={'/main-dashboard'}><button className='bg-orange-400 text-white w-full p-2 rounded-md'>Login</button></Link>
                                            </div>

                                            <a href="#" class="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Do not have account?<Link to={'/'} className='underline'>Sign up</Link></a>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                        )}
                    </div>
                </div>
            </div>

            <Footer/>
        </>
    )
}

export default Login