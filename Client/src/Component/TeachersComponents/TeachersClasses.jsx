import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const TeachersClasses = () => {
    
    const [showPopupCourses, setShowPopupCourses] = useState(false);
    const [showScheduleClass , setShowScheduleClass] =  useState(false);

    const handleCloseCourses = () => {
        setShowPopupCourses(false);
    };

    return (
        <>
            <div>
                <h1 className='text-2xl font-bold'>My Courses</h1>
                <div className='w-24 h-1 border-rounded bg-orange-500 mb-4'></div>

                <div className='grid grid-cols-4 gap-4 py-4'>
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

export default TeachersClasses