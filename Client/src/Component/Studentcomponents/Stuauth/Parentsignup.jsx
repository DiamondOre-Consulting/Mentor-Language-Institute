import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '..//..//..//assets/logo.png'
import Navbar from './Navbar';
import Footer from './Footer';

const Parentlog = () => {


    const [password, setPassword] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleShowPassword = () => {
        return setShowPass(!showPass);
    };

    return (
        <>
        <Navbar/>
        
            <section class="relative -mt-12">

                <div class="flex flex-col items-center justify-center mt-16 lg:py-0 ">
                    <div class="md:w-full sm:w-1/2 bg-white rounded-lg shadow border-t-4 border-orange-400 md:mt-0 sm:max-w-md xl:p-0">
                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <div className='flex justify-between items-center'>
                                <h1 class="text-xl  font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                    Registeration Form
                                </h1>
                                {/* <img src={logo} alt="" className='w-24' /> */}

                            </div>

                            <form class="space-y-4 md:space-y-6" action="#">

                                <div>
                                    <input type="text" name="name" id="name" placeholder="Enter Your Name" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                </div>

                                <div>
                                    <input type="email" name="email" id="email" class="bg-white border border-gray-800 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Your Email Id" required="" />
                                </div>
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
                                    {/* <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a> */}
                                </div>
                                <div className='w-full'>
                                    <Link to={'/main-dashboard'}><button className='bg-orange-400 text-white w-full p-2 rounded-md'>Register</button></Link>
                                </div>

                                <a href="#" class="text-center flex items-center justify-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Already Have Account?<Link to={'/login'} className='underline'>Sign in</Link></a>

                            </form>
                        </div>
                    </div>
                </div>
            </section>
           <Footer/>
        </>
    )
}

export default Parentlog