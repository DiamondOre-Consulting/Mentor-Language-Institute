import React, { useState } from 'react'
import { Link } from 'react-router-dom';


const TeacherHome = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupCourses, setShowPopupCourses] = useState(false);
    const [showScheduleClass , setShowScheduleClass] =  useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        setShowPopup(false);
    };

    const handleCloseScheduleClass = () =>{
        setShowScheduleClass(false)
    }

    const handleCloseCourses = () => {
        setShowPopupCourses(false);
    };


    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div>
                <div className='grid grid-cols-10  gap-8'>

                    <div className=' col-span-7'>
                        <div>
                            <h1 className='text-2xl font-bold'>My Courses</h1>
                            <div className='w-24 h-1 border-rounded bg-orange-500 mb-4'></div>

                            <div className='grid grid-cols-3 gap-4 py-4'>
                                <div className=' border rounded-md  border-0 shadow-xl hover:shadow-none cursor-pointer'>
                                    <div className='px-2 py-3 col-span-1 bg-orange-500 rounded-md'>
                                        <span className='text-sm text-white'>Course</span>
                                        <p className='   font-bold text-white '>JavaScript Fundamentals</p>
                                        <a className='text-gray-100 flex items-center text-sm mt-4 justify-end ' onClick={() => setShowPopupCourses(true)}>Veiw <svg class="h-4 w-4 text-gray-100" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <polyline points="9 6 15 12 9 18" /></svg></a>
                                    </div>

                                </div>
                                <div className=' border rounded-md shadow-xl hover:shadow-none border-0'>
                                    <div className='px-2 py-3 col-span-1 bg-orange-500 rounded-md'>
                                        <span className='text-sm text-white'>Course</span>
                                        <p className='   font-bold text-white '>JavaScript Fundamentals</p>
                                        <Link to={'/student-each-course'} className='text-gray-100 flex items-center  text-sm mt-4 justify-end '>Veiw <svg class="h-4 w-4 text-gray-100" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <polyline points="9 6 15 12 9 18" /></svg></Link>
                                    </div>

                                </div>
                                <div className=' border rounded-md shadow-xl hover:shadow-none border-0'>
                                    <div className='px-2 py-3 col-span-1 bg-orange-500 rounded-md'>
                                        <span className='text-sm text-white'>Course</span>
                                        <p className='   font-bold text-white '>JavaScript Fundamentals</p>
                                        <Link to={'/student-each-course'} className='text-gray-100 flex items-center  text-sm mt-4 justify-end '>Veiw <svg class="h-4 w-4 text-gray-100" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <polyline points="9 6 15 12 9 18" /></svg></Link>
                                    </div>

                                </div>

                            </div>
                        </div>

                        <div className='py-14'>
                            <h1 className='text-2xl font-bold'>Request For New Courses</h1>
                            <div className='w-24 h-1 border-rounded bg-orange-500 mb-4'></div>

                            <div className='grid grid-cols-3 gap-4 py-4'>
                                <div className=' border rounded-md shadow-lg border-0'>
                                    <div className='px-2 py-3 col-span-1 bg-orange-500 rounded-md'>
                                        <span className='text-sm text-white'>Course</span>
                                        <p className='   font-bold text-white '>JavaScript Fundamentals</p>
                                        <a className='text-gray-100 flex items-center  text-sm mt-4 justify-end cursor-pointer' onClick={() => setShowPopup(true)}>Apply <svg class="h-4 w-4 text-gray-100" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <polyline points="9 6 15 12 9 18" /></svg></a>
                                    </div>

                                </div>


                            </div>
                        </div>
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
                                <h1 className='font-bold text-lg'>Today's Classes</h1>
                                <div className='w-16 h-0.5 bg-orange-500 mb-6'></div>
                                <div className='border border-1 border-orange-500 flex p-2 justify-between rounded-md items-center'>
                                    <div className='text-sm'>
                                        <p className='font-bold'>Monday / <span className='text-sm text-gray-600 '>12/03/2004 </span></p>
                                        <p>12:30pm</p>
                                    </div>

                                    <div>
                                        <svg class="h-8 w-8 text-green-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="12" cy="12" r="9" />  <path d="M9 12l2 2l4 -4" /></svg>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center">

                    <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/3">

                        <div className="p-6 text-left">
                            <h2 className="text-xl font-bold text-teal-green-900 mb-4">Thankyou For Applying</h2>
                            <p className="text-sm text-gray-600 mb-6">Your Request Has Been Submitted We Will Connect You Soon.</p>
                            <button
                                className="block w-full px-4 py-2 bg-orange-400 hover:bg-orange-500 text-sm font-semibold text-white rounded-lg shadow-md  focus:outline-none "
                                onClick={handleClose}
                            >
                                close
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {showPopupCourses && (
                <div className="fixed inset-0 flex items-center justify-center">

                    <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/4">
                    <svg class="h-5 w-5 text-red-500 float-right mr-1 mt-1 " onClick={handleCloseCourses} width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                        <div className="p-6 text-left ">
                            <div className='flex  items-center justify-between mt-2'>
                                <div>
                                    <Link to={'/teacher-dashboard/allstudents'}  className='p-2 bg-orange-500 rounded-md text-gray-100 cursor-pointer'>My Students</Link>
                                </div>
                                <div>
                                    <p className='p-2 bg-orange-500 rounded-md text-gray-100 cursor-pointer'onClick={() => setShowScheduleClass(true)}>Add New Class</p>
                                </div>

                            </div>
                           
                           
                        </div>
                    </section>
                </div>
            )}


           {showScheduleClass && (
                <div className="fixed inset-0 flex items-center justify-center">

                    <section className="rounded-lg shadow-xl bg-white w-4/5 sm:w-3/5 lg:w-1/3">

                        <div className="p-6 text-left">
                            <h2 className="text-xl font-bold text-teal-green-900 mb-4">Thankyou !!</h2>
                            <p className="text-sm text-gray-600 mb-6">Your Class Has Been Scheduled</p>
                            <Link to={'/teacher-dashboard/allstudents'}
                                className="block w-full px-4 py-2 bg-orange-400 text-center hover:bg-orange-500 text-sm font-semibold text-white rounded-lg shadow-md  focus:outline-none "
                               
                            >
                                Mark Attendence
                            </Link>
                        </div>
                    </section>
                </div>
            )}




        </>
    )
}

export default TeacherHome