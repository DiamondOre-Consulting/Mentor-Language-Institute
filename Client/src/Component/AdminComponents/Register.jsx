import React, { useState } from 'react'
import { Tabs } from "flowbite-react";
import { MdDashboard } from "react-icons/md";

const Register = () => {

    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (index) => {
        setActiveTab(index);
    };

    return (
        <div className=''>
            <div className="flex flex-col justify-center items-center">
                <div className="flex space-x-4 ">
                    <button
                        className={`py-2 px-4 border-b-2 ${activeTab === 0 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                        onClick={() => handleTabClick(0)}
                    >
                        Register Parent
                    </button>
                    <button
                        className={`py-2 px-4 border-b-2 ${activeTab === 1 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                        onClick={() => handleTabClick(1)}
                    >
                        Register Student
                    </button>
                    <button
                        className={`py-2 px-4 border-b-2 ${activeTab === 2 ? 'border-orange-500' : 'border-transparent'} focus:outline-none`}
                        onClick={() => handleTabClick(2)}
                    >
                        Register Teacher
                    </button>
                </div>
                <div className="py-4">
                    {activeTab === 0 && (
                        <section class="w-full">
                            <div class="flex flex-col items-center justify-center px-6 py-8 w-full">
                                <div class="w-full max-w-screen-xl bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                        <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mx-20">
                                            Register Parent
                                        </h1>
                                        <div className='w-22 h-0.5 bg-orange-500 border-rounded'></div>
                                        <form class="space-y-4 md:space-y-6" action="#">
                                            <div>
                                                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white w-full">Your email</label>
                                                <input type="email" name="email" id="email" class=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Email Id" required="" />
                                            </div>
                                            <div>
                                                <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone</label>
                                                <input type="password" name="password" id="password" placeholder="Enter Phone No" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                            </div>
                                            <div>
                                                <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">password</label>
                                                <input type="confirm-password" name="confirm-password" id="confirm-password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                            </div>
                                            
                                           <button className='bg-orange-400 py-2 w-full rounded-md'>Submit</button>
                                            
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                    {activeTab === 1 && (
                       <section class="w-full">
                       <div class="flex flex-col items-center justify-center px-6 py-8 w-full">
                           <div class="w-full max-w-screen-xl bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                               <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                   <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mx-20">
                                       Register Student
                                   </h1>
                                   <div className='w-22 h-0.5 bg-orange-500 border-rounded'></div>
                                   <form class="space-y-4 md:space-y-6" action="#">
                                       <div>
                                           <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white w-full">Your email</label>
                                           <input type="email" name="email" id="email" class=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Email Id" required="" />
                                       </div>
                                       <div>
                                           <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone</label>
                                           <input type="password" name="password" id="password" placeholder="Enter Phone No" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                       </div>
                                       <div>
                                           <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">password</label>
                                           <input type="confirm-password" name="confirm-password" id="confirm-password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                       </div>
                                       
                                      <button className='bg-orange-400 py-2 w-full rounded-md'>Submit</button>
                                       
                                   </form>
                               </div>
                           </div>
                       </div>
                   </section>
                    )}
                    {activeTab === 2 && (
                        <section class="w-full">
                        <div class="flex flex-col items-center justify-center px-6 py-8 w-full">
                            <div class="w-full max-w-screen-xl bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mx-20">
                                        Register Teacher
                                    </h1>
                                    <div className='w-22 h-0.5 bg-orange-500 border-rounded'></div>
                                    <form class="space-y-4 md:space-y-6" action="#">
                                        <div>
                                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white w-full">Your email</label>
                                            <input type="email" name="email" id="email" class=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Email Id" required="" />
                                        </div>
                                        <div>
                                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone</label>
                                            <input type="password" name="password" id="password" placeholder="Enter Phone No" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                        </div>
                                        <div>
                                            <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">password</label>
                                            <input type="confirm-password" name="confirm-password" id="confirm-password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                        </div>
                                        
                                       <button className='bg-orange-400 py-2 w-full rounded-md'>Submit</button>
                                        
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Register