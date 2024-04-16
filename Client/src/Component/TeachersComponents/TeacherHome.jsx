import React, { useState } from 'react'

const TeacherHome = () => {

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div>
                <div className='grid grid-cols-10  gap-2'>

                    <div className=' col-span-7'>
                        Home page
                    </div>

                    <div className='col-span-3 '>

                        <div className='grid grid-rows-8 grid-flow-col gap-4'>
                            <div className='row-span-5'>
                                <h1 className='font-bold text-lg'>Recent Messages</h1>
                                <div className='w-16 h-0.5 bg-orange-500 mb-6'></div>
                                <div class="flex items-start gap-2.5">
                                    <img class="w-8 h-8 rounded-full" src="https://static.vecteezy.com/system/resources/thumbnails/001/993/889/small/beautiful-latin-woman-avatar-character-icon-free-vector.jpg" alt="Jese image" />
                                    <div class="flex flex-col gap-1 w-full max-w-[320px]">
                                        <div class="flex items-center space-x-2 rtl:space-x-reverse">
                                            <span class="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
                                            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">11:46</span>
                                        </div>
                                        <div class="flex flex-col leading-1.5 p-4 border-gray-200 bg-orange-500 shadow-md backdrop-filter backdrop-blur-md bg-opacity-20 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                                            <p class="text-sm font-normal text-gray-900 dark:text-white">How to enroll for this course?</p>
                                        </div>

                                    </div>
                                    <button id="dropdownMenuIconButton" onClick={toggleDropdown} data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" class="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" type="button">
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                                            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                        </svg>
                                    </button>
                                    {isOpen && (
                                        <div className="z-10 absolute right-10 mt-16 bg-white divide-y divide-gray-100 rounded-lg shadow w-20 dark:bg-gray-700 dark:divide-gray-600">
                                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
                                                <li>
                                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Reply</a>
                                                </li>


                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                                        
                                

                            <div className=' row-span-2'>
                            <h1 className='font-bold text-lg'>Classes Schedule</h1>
                                <div className='w-16 h-0.5 bg-orange-500 mb-6'></div>
                                <div className='border border-1 border-orange-500 flex p-2 justify-between rounded-md items-center'>
                                    <div className='text-sm'>
                                        <p className='font-bold'>Monday / <span className='text-sm text-gray-600 '>12/03/2004 </span></p>
                                        <p>12:30pm</p>
                                    </div>

                                    <div>
                                    <svg class="h-8 w-8 text-green-500"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="12" cy="12" r="9" />  <path d="M9 12l2 2l4 -4" /></svg>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    )
}

export default TeacherHome